import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import ConnectPg from 'connect-pg-simple';
import env from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import *  as url from "url";
import path from "path";
import fileUpload from "express-fileupload";
import fs from "fs";
import yesql from 'yesql';
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";
import { Validator } from "node-input-validator";
import * as g from "../global.js";

const router = express.Router();

//routes
{
router.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.log(err);
        }
        res.sendStatus(200);
    });
});


router.post(
    "/login",
    (req, res, next) => {
        passport.authenticate('local', function (err, user, info, status) {
            if (err) {
                return res.status(400).send(err);
            }
            if (!user) {
                return res.status(400).send("missing crendentials");
            }

            req.logIn(user, function (err) {
                if (err) { return next(err); }

                remember_session(req, config.cookie_remember);
                res.sendStatus(200);
            });

        })(req, res, next);
    }
);

//the sign in/up with google button was pressed
router.get("/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

//redirect after login
router.get(config.google_login_redirect, function (req, res, next) {
    passport.authenticate('google', function (err, user, info, status) {
        if (err) { return next(err) }
        if (!user) { return res.redirect(config.client_url); }

        req.logIn(user, function (err) {
            if (err) { return next(err); }

            if (info.new)
                req.session.showStartMessage = true;

            remember_session(req, config.cookie_remember);
            return res.redirect(config.client_url);
        });
    })(req, res, next);
});
}

//use
function initialize()
{
passport.use(
    "local",
    new Strategy(
        { // or whatever you want to use
            usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
            passwordField: 'password'
        },
        async function verify(email, password, cb) {
            try {
                const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
                    email
                ]);
                if (result.rows.length > 0) {
                    const user = result.rows[0];
                    const storedHashedPassword = user.password_hash;
                    bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                        if (err) {
                            //Error with password check
                            console.error("Error comparing passwords:", err);
                            return cb(err);
                        } else {
                            if (valid) {
                                //Passed password check
                                return cb(null, user);
                            } else {
                                //Did not pass password check
                                return cb("Wrong password", false);
                            }
                        }
                    });
                } else {
                    //user not found
                    return cb("Wrong email", false);
                }
            } catch (err) {
                console.error(err);
            }
        })
);

passport.use(
    "google",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: config.server_url + config.google_login_redirect,
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const query_result = await db.query("SELECT * FROM users WHERE email=$1", [profile.email])
                if (query_result.rowCount === 0) {
                    const result = await db.query(
                        named("INSERT INTO users (username,name,email,password_hash) VALUES (:username, :name,:email,:password_hash) RETURNING *",)({
                            username: "test",
                            name: profile.displayName,
                            email: profile.email,
                            password_hash: "google"
                        })
                    );
                    cb(null, result.rows[0], { new: true });
                }
                else {
                    cb(null, query_result.rows[0]);
                }
            }
            catch (err) {
                console.log(err);
                cb(err);
            }
        }
    )
);

passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user);
});
}

function remember_session(req, time) {
    req.session.cookie.maxAge = time;
}

function auth(req, res)//checking if the user is admin
{
    if (req.isAuthenticated()) {
        return true;
    }
    else {
        res.sendStatus(401);
        return false;
    }
}

export default initialize;
export {auth, remember_session, router};


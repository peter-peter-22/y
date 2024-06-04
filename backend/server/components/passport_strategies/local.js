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
import { universal_auth, finish_registration, user_columns } from "../passport.js";
import { CheckV } from "../validations.js";
const named = yesql.pg;

const router = express.Router();

//routes
{
    router.post(
        "/login",
        (req, res, next) => {
            passport.authenticate('local', function (err, user, info, status) {
                universal_auth(req, res, err, user, info);
            })(req, res, next);
        }
    );
}

//use
{
    passport.use(
        "local",
        new Strategy(
            { 
                usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
                passwordField: 'password'
            },
            async function verify(email, password, cb) {
                try {
                    const result = await db.query(`SELECT ${user_columns} FROM users WHERE email = $1 `, [
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
}

router.post("/submit_password", async (req, res) => {
    const v = new Validator(req.body, {
        password: 'required|minLength:8',
    });
    await CheckV(v);


    if (req.session.registered_data === undefined)
        return (res.status(400).send("no registered data"));

    const data = req.session.registered_data;
    if (data.verified === false)
        return (res.status(400).send("this email is not verified"));

    try {
        const { password } = req.body;
        bcrypt.hash(password, config.saltRounds, async (err, hash) => {
            if (err) {
                console.error("Error hashing password:", err);
            } else {
                await finish_registration(req, res, data.name, data.email, hash, data.birthdate, data.checkboxes);
            }
        });
    } catch (err) {
        console.log(err);
    }
});

export default router;


import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GithubStrategy from "passport-github2";
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
import { universal_auth } from "../passport.js";
import { user_columns } from "../../routes/logged_in/post_query.js";
const named = yesql.pg;

const router = express.Router();
const github_login_redirect = process.env.GITHUB_CALLBACK;

//routes
{
    //the sign in/up with google button was pressed
    router.get("/auth/github",
        passport.authenticate("github", {
            scope: ["user:email"]
        })
    );

    //redirect after login
    router.get(github_login_redirect, function (req, res, next) {
        passport.authenticate('github', function (err, user, info, status) {
         universal_auth(req,res,err,user,info);
        })(req, res, next);
    });
}

//uses
{
    passport.use(
        "github",
        new GithubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: config.address_mode.server + github_login_redirect,
            },
            async (accessToken, refreshToken, profile, cb) => {
                try {
                    let email;
                    try {
                        email = profile.emails[0].value;
                        if (email === undefined)
                            throw new Error();
                    }
                    catch {
                        return cb(new Error("this github account has no public email"));
                    }

                    const query_result = await db.query(`SELECT ${user_columns} FROM users WHERE email=$1`, [email])
                    if (query_result.rowCount === 0) {
                        // const result = await db.query(
                        //     named("INSERT INTO users (username,name,email,password_hash) VALUES (:username, :name,:email,:password_hash) RETURNING *",)({
                        //         username: "test",
                        //         name: profile.username,
                        //         email: email,
                        //         password_hash: "github"
                        //     })
                        // );
                        cb(null, null, {
                            registering: {
                                name: profile.username,
                                email: email,
                            }
                        });
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
}

export default router;


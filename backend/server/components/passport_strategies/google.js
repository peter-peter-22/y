import express from "express";
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
import { universal_auth,user_columns } from "../passport.js";
const named = yesql.pg;

const router = express.Router();
const google_login_redirect=  process.env.GOOGLE_CALLBACK;

//routes
{
    //the sign in/up with google button was pressed
    router.get("/auth/google",
        passport.authenticate("google", {
            scope: ["profile", "email", ]
        })
    );

    //redirect after login
    router.get(google_login_redirect, function (req, res, next) {
        passport.authenticate('google', function (err, user, info, status) {
            universal_auth(req,res,err,user,info);
        })(req, res, next);
    });
}

//uses
{
    passport.use(
        "google",
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: config.address_mode.server + google_login_redirect,
            },
            async (accessToken, refreshToken, profile, cb) => {
                try {
                    const query_result = await db.query(`SELECT ${user_columns} FROM users WHERE email=$1`, [profile.email])
                    if (query_result.rowCount === 0) {
                      cb(null, null, {
                        registering: {
                            name: profile.displayName,
                            email: profile.email,
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

export default router ;


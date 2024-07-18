import express from "express";
import "express-async-errors";
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
const named = yesql.pg;
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";

//initialize and set global variables
import * as c from "./config.js";
await c.initialize();
import "./components/validations.js";

//add middlewares
import initialize_app from "./components/app_use.js";
initialize_app();

//add routes to app
import register from "./routes/register.js";
app.use('/', register);

import user from "./routes/user.js";
app.use("/user", user);

import member from "./routes/logged_in.js";
app.use("/member", member);

import { router as passport_routes } from "./components/passport.js";
app.use("/", passport_routes);

import webpush from "./routes/web_push.js";
app.use("/", webpush);

//error
const extra_debug = true;//log the errors those would not be logged normally
app.use((err, req, res, next) => {
    if (!err.status) {
        //error without status is unintended
        console.log("CAUGHT internal server error:");
        console.error(err)
        res.status(500).send("Internal server error: '" + err.message + "'");
    }
    else {
        //error with status is normal
        res.status(err.status).send(err.message);

        if (extra_debug) {
            console.log("EXTRA DEBUG error:");
            console.error(err)
        }
    }
});

const port = config.port;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
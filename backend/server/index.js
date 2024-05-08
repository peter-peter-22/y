import express from "express";
import "express-async-errors";
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
const named = yesql.pg;
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";
import * as g from "./global.js";
await g.initialize();
import "./components/validations.js";

import initialize_app from "./components/app_use.js";
initialize_app();
import { router as passport_routes } from "./components/passport.js";

//routes
import general from "./routes/general.js";
app.use('/', general);

import register from "./routes/register.js";
app.use('/', register);

import user from "./routes/user.js";
app.use("/user", user);

import member from "./routes/logged_in.js";
app.use("/member", member);

app.use("/", passport_routes);

//error
app.use((err, req, res, next) => {
    if (!err.status) {
        console.error(err)
        res.status(500).send("Internal server error: '" + err.message + "'");
    }
    else {
        res.status(err.status).send(err.message);
    }
});

const port = config.port;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
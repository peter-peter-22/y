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
const named = yesql.pg;
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";
import { Validator } from "node-input-validator";
import * as g from "../global.js";
const pgSession = ConnectPg(session);

function initialize()
{
g.app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
g.app.use(express.static("public"));
g.app.use(express.json());//required to get the body of the fetch post


g.app.use(
    session({
        store: new pgSession({
          pool: g.pgPool,
          tableName: 'session'
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true if using HTTPS
            maxAge: false,
        }
    })
);

//update session expiration 
g.app.use((req, res, next) => {
    req.session.lastVisit = new Date();
    next();
});

g.app.use(bodyParser.urlencoded({ extended: true }));
g.app.use(
    fileUpload({
        limits: {
            fileSize: 10000000, // Around 10MB
        },
        abortOnLimit: true,
    })
);


g.app.use(passport.initialize());
g.app.use(passport.session());
}
export default initialize;
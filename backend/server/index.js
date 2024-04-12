import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import ConnectPg from 'connect-pg-simple';
var pgSession = ConnectPg(session);
import env from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import *  as url from "url";
import path from "path";
import fileUpload from "express-fileupload";
import fs from "fs";
import yesql from 'yesql';
const named = yesql.pg;
env.config();
import cors from "cors";

//global constants-------------------------------------------------------------------------------------------------------------------------

//general
const app = express();
const port = 3000;
const saltRounds = 10;
const __dirname = dirname(fileURLToPath(import.meta.url));
const server_url = process.env.SERVER_URL;

//this folder stores the uploaded images of the products, it's must be in synchron with the sql
const uploaded_images_folder = __dirname + '/public/images/uploaded/';

//cookie expiration when remember me is enabled
const cookie_remember = 1000 * 60 * 60 * 24 * 30//1 month

//global constants end-------------------------------------------------------------------------------------------------------------------------

app.use(cors());
app.use(express.static("public"));
app.use(express.json());//required to get the body of the fetch post

//const db = new pg.Client({
//    user: process.env.PG_USER,
//    host: process.env.PG_HOST,
//    database: process.env.PG_DATABASE,
//    password: process.env.PG_PASSWORD,
//    port: process.env.PG_PORT,
//});
//await db.connect();

//const pgPool = new pg.Pool({
//  user: process.env.PG_USER,
//  host: process.env.PG_HOST,
//  database: process.env.PG_DATABASE,
//  password: process.env.PG_PASSWORD,
//  port: process.env.PG_PORT,
//});

//app.use(
//  session({
//    store: new pgSession({
//      pool: pgPool,
//      tableName: 'user_sessions'
//    }),
//    secret: process.env.SESSION_SECRET,
//    resave: false,
//    saveUninitialized: false,
//    cookie: {
//      secure: false, // Set to true if using HTTPS
//      maxAge: false
//    }
//  })
//);

//update session expiration 
//app.use((req, res, next) => {
//    req.session.lastVisit = new Date();
//    next();
//});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    fileUpload({
        limits: {
            fileSize: 10000000, // Around 10MB
        },
        abortOnLimit: true,
    })
);


//app.use(passport.initialize());
//app.use(passport.session());

//sending user data to client
//app.use((req, res, next) => {
//    res.locals.user = req.user;
//    next();
//});


app.get("/", async (req, res) => {
    res.json({ user: 0 });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});




function auth(req, res, type = 0)//checking if the user is admin
{
    //if (req.isAuthenticated()) {
    //    return true;
    //}
    //else {
    //    return false;
    //}
}
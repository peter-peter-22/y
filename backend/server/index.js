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
import axios from "axios";
import nodemailer from "nodemailer";

//global constants-------------------------------------------------------------------------------------------------------------------------

const app = express();
const port = 3000;
const saltRounds = 10;
const __dirname = dirname(fileURLToPath(import.meta.url));
const server_url = process.env.SERVER_URL;
const google_rechapta_secret_key = process.env.GOOGLE_RECHAPTA_SECRET;

//this folder stores the uploaded images of the products, it's must be in synchron with the sql
const uploaded_images_folder = __dirname + '/images/uploaded/';

//cookie expiration when remember me is enabled
const cookie_remember = 1000 * 60 * 60 * 24 * 30//1 month

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

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

//global constants end-------------------------------------------------------------------------------------------------------------------------

//app.use 


app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.static("public"));
app.use(express.json());//required to get the body of the fetch post


app.use(
    session({
        //store: new pgSession({
        //  pool: pgPool,
        //  tableName: 'user_sessions'
        //}),
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


app.use(passport.initialize());
app.use(passport.session());

//sending user data to client
//app.use((req, res, next) => {
//    res.locals.user = req.user;
//    next();
//});

//app.use end


app.get("/", async (req, res) => {
    res.json({ user: 0 });
});

app.post('/register', async (req, res) => {
    const { recaptchaToken, name, email, birthdate } = req.body;

    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${google_rechapta_secret_key}&response=${recaptchaToken}`);
        const { success } = response.data;

        if (success) {
            //send verificationcode in email
            const code = generateVerificationCode();
            req.session.verification_code = code;
            req.session.registered_data = {
                name: name,
                email: email,
                birthdate: birthdate,
                verified: false
            }
            res.send('reCAPTCHA validation successful');

            const mailOptions = {
                from: transporter.options.auth.user,
                to: req.body.email,
                subject: 'Y email verification',
                text: 'Your verification code is "' + code + '"'
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
            });

        } else {
            res.status(400).send('reCAPTCHA validation failed');
        }
    } catch (error) {
        console.error('Error validating reCAPTCHA:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/verify_code', async (req, res) => {
    const { code } = req.body;
    if (code === req.session.verification_code && code !== undefined) {
        try {
            req.session.registered_data.verified = true;
            res.status(200).send("chapta successful");
        }
        catch {
            res.status(400).send("the user data is missing");
        }
    }
    else {
        res.status(400).send("failed rechapta");
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


function generateVerificationCode(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }

    return result;
}

function auth(req, res, type = 0)//checking if the user is admin
{
    //if (req.isAuthenticated()) {
    //    return true;
    //}
    //else {
    //    return false;
    //}
}
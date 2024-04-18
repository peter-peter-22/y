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
const cookie_remember = 1000 * 60 * 60 * 24 * 30//1 month. the user most log in at least once within a month to prevent logout
const cookie_registering = 1000 * 60 * 60 * 2;//2 hours. the email, name, ect. the user sends at the start of the registration must be finalized within 2 hour

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
await db.connect();

const pgPool = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

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
app.use((req, res, next) => {
    req.session.lastVisit = new Date();
    next();
});

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

app.post('/register_start', async (req, res) => {
    const { recaptchaToken, name, email, birthdate, checkboxes } = req.body;

    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${google_rechapta_secret_key}&response=${recaptchaToken}`);
        const { success } = response.data;

        if (success) {
            //send verificationcode in email
            const code = generateVerificationCode();
            req.session.registered_data = {
                name: name,
                email: email,
                birthdate: birthdate,
                verified: false,
                verification_code: code,
                checkboxes: checkboxes
            }

            remember_session(req, cookie_registering);

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
    if (code === req.session.registered_data.verification_code && code !== undefined) {
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

app.post("/submit_password", async (req, res) => {
    req.session.registered_data = {
        name: "Peter",
        email: "szaladospeti1@gmail.com",
        birthdate: "",
        verified: true,
        verification_code: 123456,
    }

    const { password } = req.body;
    if (password === undefined || password.length < 8)
        return (res.status(400).send("invalid password"));

    if (req.session.registered_data === undefined)
        return (res.status(400).send("no registered data"));

    const data = req.session.registered_data;
    if (data.verified === false)
        return (res.status(400).send("this email is not verified"));

    try {

        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                console.error("Error hashing password:", err);
            } else {
                try {
                    const result = await db.query(
                        named("INSERT INTO users (username,name,email,password_hash) VALUES (:username, :name,:email,:password_hash) RETURNING *",)({
                            username: "test",
                            name: data.name,
                            email: data.email,
                            password_hash: hash
                        })
                    );

                    const user = result.rows[0];
                    req.login(user, (err) => {
                        remember_session(req, cookie_remember);

                        res.send("registered successfully");
                        //res.redirect("/profile");
                    });
                } catch (e) {
                    // if (e.constraint == "users_email_key")
                    //     floating_error_message(req, "This email is already registered");
                    // else if (e.constraint == "users_username_key")
                    //     floating_error_message(req, "This username is already registered");
                    // else
                    // {
                    //     floating_error_message(req, e.message);
                    // }

                    // res.redirect(req.headers.referer);

                    res.status(400).send("error");
                }
            }
        });
    } catch (err) {
        console.log(err);
    }
});

app.post(
    "/login",
    (req, res, next) => {
        passport.authenticate('local', function (err, user, info, status) {
            if (err) {
               return res.status(400).send(err);
            }
            if(!user)
            {
              return res.status(400).send("missing crendentials");
            }

            req.logIn(user, function (err) {
                if (err) { return next(err); }

                remember_session(req, cookie_remember);

                res.sendStatus(200);
            });

        })(req, res, next);
    }
);

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

app.post('/user_exists', async (req, res) => {
    const { email } = req.body;
    const result = await db.query(named("SELECT count(*) FROM users WHERE email=:email")({ email: email }));
    if (result.rows[0].count > 0)
        return res.sendStatus(200);
    else
        return (res.status(400).send("No Y user belong to this email"));
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

function auth(req, res)//checking if the user is admin
{
    //if (req.isAuthenticated()) {
    //    return true;
    //}
    //else {
    //    return false;
    //}
}

function remember_session(req, time) {
    req.session.cookie.maxAge = time;
}

passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user);
});
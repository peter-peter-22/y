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
import { CheckV } from "../components/validations.js";
import * as g from "../global.js";
import * as pp from "../components/passport.js";

const router = express.Router();

router.post('/register_start', async (req, res) => {
    const { recaptchaToken, name, email, birthdate, checkboxes } = req.body;

    const v = new Validator(req.body, {//validate birthdate and checkboxes
        name: 'required|name',
        email: "required|email",
    });
    console.log(birthdate);
    console.log(checkboxes);

    await CheckV(v);

    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${config.google_rechapta_secret_key}&response=${recaptchaToken}`);
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

        pp.remember_session(req, config.cookie_registering);

        res.send('reCAPTCHA validation successful');

        const mailOptions = {
            from: g.transporter.options.auth.user,
            to: req.body.email,
            subject: 'Y email verification',
            text: 'Your verification code is "' + code + '"'
        };

        g.transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
        });

    } else {
        res.status(400).send('reCAPTCHA validation failed');
    }
});

router.post('/verify_code', async (req, res) => {
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
        res.status(400).send("wrong code");
    }
});

router.post("/submit_password", async (req, res) => {
    //  req.session.registered_data = {
    //      name: "Peter",
    //      email: "szaladospeti1@gmail.com",
    //      birthdate: "",
    //      verified: true,
    //      verification_code: 123456,
    //  }

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
                        pp.remember_session(req, config.cookie_remember);
                        req.session.showStartMessage = true;//this bool will show the dialog the asks for the @username, profile pic...
                        res.send("registered successfully");
                    });
                } catch (e) {
                    if (e.constraint == "users_email_key")
                        res.status(400).send("this email is already registered");
                    else if (e.constraint == "users_username_key")
                        res.status(400).send("this username is already registered");
                    else {
                        console.log(e);
                        res.sendStatus(500);
                    }
                }
            }
        });
    } catch (err) {
        console.log(err);
    }
});

function generateVerificationCode() {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }

    return result;
}


export default router;
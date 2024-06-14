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
const named = yesql.pg;
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";
import { Validator } from "node-input-validator";
import { CheckErr, CheckV } from "../components/validations.js";
import * as g from "../config.js";
import * as pp from "../components/passport.js";
import { exists_email } from "./user.js";

const router = express.Router();
const skip = true;//skip rechapta and verification

router.post('/register_start', async (req, res) => {
    //get inputs
    const v = new Validator(req.body, {
        name: 'required|name',
        email: "required|email",
        checkboxes: "array",
        birthdate: "required|datepast",
        recaptchaToken: "required"
    });
   if(!skip) await CheckV(v);
    const { recaptchaToken, name, email, birthdate, checkboxes } = req.body;

    //check if email is taken
    const exists = await exists_email(email);
    if(exists)
        CheckErr("This email is already taken");

    //check rechapta solution
    if(!skip)  await CheckRechapta(recaptchaToken);

    //store registered data and the verification code in session
    const code = generateVerificationCode();
    req.session.registered_data = {
        name: name,
        email: email,
        birthdate: new Date(birthdate).toISOString(),
        verified: false,
        verification_code: code,
        checkboxes: checkboxes
    }
    pp.remember_session(req, config.cookie_registering);

    //send verification code in email
    const mailOptions = {
        from: g.transporter.options.auth.user,
        to: req.body.email,
        subject: 'Email verification',
        text: 'Your verification code is "' + code + '"'
    };

   await SendMailAsync(mailOptions);

    res.sendStatus(200);
});

async function SendMailAsync(mailOptions)
{
    return new Promise(resolve => {
        g.transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                throw error;
            }
            resolve();
        });
    });
}

router.post('/verify_code', async (req, res) => {
    const { code } = req.body;
    if (code === req.session.registered_data.verification_code && code !== undefined || skip) {
        try {
            req.session.registered_data.verified = true;
            //email verification code is ok
            res.sendStatus(200);
        }
        catch {
            res.status(400).send("the user data is missing");
        }
    }
    else {
        res.status(400).send("wrong code");
    }
});

async function CheckRechapta(recaptchaToken) {
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${config.google_rechapta_secret_key}&response=${recaptchaToken}`);
    const { success } = response.data;
    if (!success)
        CheckErr('reCAPTCHA validation failed');
}

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
export { CheckRechapta,SendMailAsync };
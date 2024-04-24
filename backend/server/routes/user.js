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
import "express-async-errors";

const router = express.Router();

router.post('/exists/email', async (req, res) => {
    try {
        const v = new Validator(req.body, {
            email: 'required|email',
        });
        const matched = await v.check();
        if (!matched)
            res.send(false);

        const { email } = req.body;
        const result = await db.query(named("SELECT count(*) FROM users WHERE email=:email")({ email: email }));
        res.send(result.rows[0].count > 0);
    }
    catch (err) {
        res.sendStatus(500);
        console.log(err);
    }
});

router.post('/exists/username', async (req, res) => {
    const v = new Validator(req.body, {
        username: 'required|email',
    });
    const matched = await v.check();
    if (!matched)
        res.send(false);

    const { username } = req.body;
    res.send(username_exists(username));
});

async function username_exists(username) {
    const result = await db.query(named("SELECT count(*) FROM users WHERE username=:username")({ username: username }));
    return result.rows[0].count > 0;
}

async function selectable_username(new_username, current_username) {
    const exists = await username_exists(new_username);
    return (!exists || new_username === current_username);
}

export default router;
export { username_exists, selectable_username };
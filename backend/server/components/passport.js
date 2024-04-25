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
import { basename, dirname } from "path";
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
import LocalRoutes from "./passport_strategies/local.js";
import GoogleRoutes from "./passport_strategies/google.js";
import GithubRoutes from "./passport_strategies/github.js";
import { CheckV } from "./validations.js";
const named = yesql.pg;

const router = express.Router();

//strategies
{
    router.use(LocalRoutes);
    router.use(GoogleRoutes);
    router.use(GithubRoutes);
}

router.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.log(err);
        }
        res.sendStatus(200);
    });
});

passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user);
});

function remember_session(req, time) {
    req.session.cookie.maxAge = time;
}

function auth(req, res)//checking if the user is admin
{
    if (req.isAuthenticated()) {
        return true;
    }
    else {
        res.sendStatus(401);
        return false;
    }
}

function universal_auth(req, res, err, user, info) {
    try {
        if (err) { throw err; }
        if (!user) {
            if (info.registering) {
                req.session.pending_data = info.registering
                req.session.pending_registration = true;
                return res.redirect(config.client_url);
            }
            else
                throw new Error("failed to get user");
        }

        req.logIn(user, function (err) {
            if (err) { throw err; }
            remember_session(req, config.cookie_remember);
            res.redirect(config.client_url);
        });
    }
    catch (err) {
        console.log(err);
        return res.send(err.message);
    }
}

router.get("/exit_registration", (req, res) => {
    req.session.pending_registration = undefined;
    res.sendStatus(200);
});

router.post("/finish_registration", async (req, res) => {
    const { birthdate, checkboxes } = req.body;
    const v = new Validator(req.body, {
        checkboxes: "array",
        birthdate: "required|datepast"
    });
    if (checkboxes === undefined)
        checkboxes = [];
    await CheckV(v);

    const { name, email } = req.session.pending_data;
    await finish_registration(req, res, name, email, "", birthdate, checkboxes);
});

async function finish_registration(req, res, name, email, password_hash, birthdate, checkboxes) {
    try {

        const uniquefied_name = await unique_username(name);
        const result = await db.query(
            named("INSERT INTO users (username,name,email,password_hash,birthdate,email_notifications) VALUES (:username, :name,:email,:password_hash,:birthdate,:email_notifications) RETURNING *",)({
                username: uniquefied_name,
                name: name,
                email: email,
                password_hash: password_hash,
                password_hash: "",
                birthdate: birthdate,
                email_notifications: checkboxes.includes("emails")
            })
        );

        const user = result.rows[0];
        req.logIn(user, function (err) {
            if (err) { throw err; }
            req.session.showStartMessage = true;
            remember_session(req, config.cookie_remember);
            res.sendStatus(200);
        });
    }
    catch (e) {
        if (e.constraint == "users_email_key")
            res.status(400).send("this email is already registered");
        else if (e.constraint == "users_username_key")
            res.status(400).send("this username is already registered");
        else {
            throw e;
        }
    }
}

async function unique_username(baseName) {
    const result = await db.query(named("SELECT username FROM users WHERE name LIKE :baseName || '%'")({ baseName: baseName }));
    if (result.rowCount === 0)
        return baseName;
    const avoid = result.rows.map(row => row.username);
    const maxUsernameNameLength = 50;
    const maxNumberLength = maxUsernameNameLength - basename.length;
    const maxNumber = Math.min(Math.pow(10, maxNumberLength) - 1, Number.MAX_SAFE_INTEGER);
    //try add a number to the base name until reaching an unique name
    for (let n = 0; n <= maxNumber; n++) {
        const attempt = baseName + n;
        if (!avoid.incudes(attempt))
            return attempt;
    }
    //if the base name is too long and all numbered versions are taken, return only a number
    for (let n = 0; n <= Number.MAX_SAFE_INTEGER; n++) {
        if (!avoid.incudes(n))
            return n;
    }
    throw new Error("unique name cannot be created");
}

export { auth, remember_session, router, universal_auth, finish_registration };


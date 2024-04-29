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
import * as g from "../global.js";
import * as pp from "../components/passport.js";
import { username_exists, selectable_username } from "./user.js";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr } from "../components/validations.js";

const router = express.Router();

router.use((req, res, next) => {
    if (pp.auth(req, res))
        next();
});

router.post("/update_profile_picture", async (req, res) => {
    const file = req.files.image;

    const imagesType = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!imagesType.includes(file.mimetype))
        res.status(400).send("invalid image, only .jpg images are accepted");

    file.mv(config.__dirname + "/public/images/profiles/" + req.user.id + ".jpg");
    res.sendStatus(200);
});

router.get("/close_starting_message", async (req, res) => {
    req.session.showStartMessage = false;
    res.sendStatus(200);
});

router.post("/change_username", async (req, res) => {
    const v = new Validator(req.body, {
        username: 'required|username',
    });
    await CheckV(v);

    const { username } = req.body;

    const selectable = await selectable_username(username, req.user.username);
    if (!selectable)
        CheckErr("this username is not available");

    const result = await db.query(named("UPDATE users SET username=:username WHERE id=:id RETURNING *")({ username: username, id: req.user.id }));
    await ApplySqlToUser(result, req);
    res.sendStatus(200);
});

router.post('/ok_username', async (req, res) => {
    if (pp.auth(req, res)) {

        const v = new Validator(req.body, {
            username: 'required|username',
        });
        const matched = await v.check();
        if (!matched)
            return res.send(false);;

        const { username } = req.body;
        const selectable = await selectable_username(username, req.user.username);
        res.send(selectable);
    }
});

router.post("/change_browser_notifications", async (req, res) => {
    const v = new Validator(req.body, {
        enabled: 'required|boolean',
    });
    await CheckV(v);

    const result = await db.query(named("UPDATE users SET browser_notifications=:enabled WHERE id=:id RETURNING *")({ enabled: req.body.enabled, id: req.user.id }));
    await ApplySqlToUser(result, req);
    res.sendStatus(200);
});

router.post("/follow_user", async (req, res) => {
    const v = new Validator(req.body, {
        id: 'required|integer',
        set: "required|boolean"
    });
    await CheckV(v);
    const { id, set } = req.body;
    if (set)
        await db.query(named("INSERT INTO follows (follower,followed) VALUES (:me,:other) ")({ me: req.user.id, other: id }));
    else
        await db.query(named("DELETE FROM follows WHERE follower=:me AND followed=:other")({ me: req.user.id, other: id }));
    res.sendStatus(200);
});

router.post("/is_following_user", async (req, res) => {
    const v = new Validator(req.body, {
        id: 'required|integer',
    });
    await CheckV(v);
    const { id } = req.body;
    const result = await db.query(named("SELECT count(*) FROM follows WHERE follower=:me AND followed=:id")({ me: req.user.id, followed: id }));
    res.send(result.rows[0].count > 0)
});

async function UpdateUser(newUser, req) {
    return new Promise(resolve => {
        req.logIn(newUser, (err) => {
            if (err)
                throw (err);
            resolve();
        });
    });
}

async function ApplySqlToUser(query_result, req) {
    await UpdateUser(query_result.rows[0], req);
}

export default router;
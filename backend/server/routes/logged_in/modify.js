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
import * as g from "../../global.js";
import * as pp from "../../components/passport.js";
import { username_exists, selectable_username } from "../user.js";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr, validate_image } from "../../components/validations.js";
import { ApplySqlToUser, UpdateUser, UpdateUserAfterChange } from "../logged_in.js";
import Moment from "moment";

const router = express.Router();

router.post("/update_profile_picture", async (req, res, next) => {
    const file = req.files.image;
    update_profile_picture(req, next, file);
    res.sendStatus(200);
});

function update_profile_picture(req, next, file) {
    update_profile_file(req, next, file, "profiles");
}
function update_profile_banner(req, next, file) {
    update_profile_file(req, next, file, "banners");
}

function update_profile_file(req, next, file, foldername) {
    try {
        validate_image(file);
        file.mv(config.__dirname + "/public/images/" + foldername + "/" + req.user.id + ".jpg");
    }
    catch (err) {
        next(err);
    }
}


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
    await update_username(req, username);

    res.sendStatus(200);
});

async function update_username(req, username, skip_update = false) {
    const selectable = await selectable_username(username, req.user.username);
    if (!selectable)
        CheckErr("this username is not available");

    const result = await db.query(named("UPDATE users SET username=:username WHERE id=:id RETURNING *")({ username: username, id: req.user.id }));
    if (!skip_update)
        await ApplySqlToUser(result, req);
}

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

router.post("/update_profile", async (req, res, next) => {
    //valdiate user data
    const v = new Validator(req.body, {
        username: 'username',
        birthdate: "datepast",
        name: "name",
        bio: "string"
    });
    await CheckV(v);

    //update user data
    const user_id = req.user.id;
    const { username, birthdate, name, bio } = req.body;
    if (username !== undefined)
        await update_username(req, next, username, true);
    if (birthdate !== undefined)
        await db.query(named("UPDATE users SET birthdate=:birthdate where id=:user_id")({ user_id: user_id, birthdate: ISOToSQL(birthdate) }));
    if (name !== undefined)
        await db.query(named("UPDATE users SET name=:name WHERE id=:user_id")({ name: name, user_id: user_id }));
    if (bio !== undefined)
        await db.query(named("UPDATE users SET bio=:bio WHERE id=:user_id")({ bio: bio, user_id: user_id }));

    if (req.files) {
        //update pics
        const { profile_pic, banner_pic } = req.files;
        if (profile_pic !== undefined)
            await update_profile_picture(req, next, profile_pic);
        if (banner_pic !== undefined)
            await update_profile_banner(req, next, banner_pic);
    }

    //apply changes to logged in user
    await UpdateUserAfterChange(req);

    res.sendStatus(200);
});

export default router;
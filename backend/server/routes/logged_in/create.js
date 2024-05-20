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
import * as g from "../../global.js";
import * as pp from "../../components/passport.js";
import { username_exists, selectable_username } from "../user.js";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr, validate_image } from "../../components/validations.js";
import { ApplySqlToUser, UpdateUser } from "../logged_in.js";
import { postQuery } from "./general.js";

const router = express.Router();

router.post("/post", async (req, res, next) => {
    reply_or_post(req, res, next, false);
});

router.post("/comment", async (req, res, next) => {
    reply_or_post(req, res, next, true);
});

async function reply_or_post(req, res, next, is_comment) {
    try {
        const checks = {
            text: "required|string|maxLength:5",
        };
        if (is_comment) {
            checks.replying_to = "required|integer";
        }

        const v = new Validator(req.body, checks);
        await CheckV(v);

        const files = tryGetFiles(req, "images");
        if (files !== undefined)
            files.forEach(file => {
                validate_image(file);
            });

        const { text } = req.body;
        let replying_to = is_comment ? req.body.replying_to : null;

        let result;
        try {
            result = await db.query(named("INSERT INTO posts (publisher,text,image_count,replying_to) VALUES (:user_id, :text,:image_count,:replying_to) RETURNING id")(
                {
                    user_id: req.user.id,
                    text: text,
                    image_count: files ? files.length : 0,
                    replying_to: replying_to
                }
            ));
        }
        catch (err) {
            if (err.constraint === "replying_to_fkey")
                CheckErr("this post does not exists");
            throw (err);
        }

        const post_id = result.rows[0].id;

        if (files !== undefined)
            files.forEach((file, index) => {
                file.mv(config.__dirname + "/public/images/posts/" + post_id + "_" + index + ".jpg");
            });

        //return the created post to client
        const recentlyAddedPost = await postQuery(req, next, undefined, " WHERE post.id=:post_id", { post_id: post_id });
        res.send(recentlyAddedPost[0]);
    }
    catch (err) {
        next(err);
    }
}

function tryGetFiles(req, fileName) {
    if (req.files) {
        const target = req.files[fileName];
        if (target !== undefined && !Array.isArray(target))
            return [target];
        else
            return target;
    }
    return undefined;
}

export default router;
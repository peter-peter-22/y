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
    reply_or_post_or_quote(req, res, next, false);
});

router.post("/comment", async (req, res, next) => {
    reply_or_post_or_quote(req, res, next, true);
});

router.post("/quote", async (req, res, next) => {
    reply_or_post_or_quote(req, res, next, false, true);
});

async function reply_or_post_or_quote(req, res, next, is_comment, is_quote) {
    try {
        //validate
        const checks = {
            text: "required|string|maxLength:5",
        };
        if (is_comment) {
            checks.replying_to = "required|integer";
        }
        else if (is_quote) {
            checks.quoted = "required|integer";
        }

        const v = new Validator(req.body, checks);
        await CheckV(v);

        const files = tryGetFiles(req, "images");
        if (files !== undefined)
            files.forEach(file => {
                validate_image(file);
            });

        //upload to database
        const { text } = req.body;
        const replying_to = is_comment ? req.body.replying_to : null;
        const quoted = is_quote ? req.body.quoted : null;
        if (is_quote) {
            const quote_query = await db.query(named("select exists(select * from posts where id=:post_id and repost is not null and text is null) as contains_repost")({ post_id: quoted }));

            if (quote_query.rowCount !== 0 && quote_query.rows[0].contains_repost)//if the quoted post does not exists, the constraint will throw an error in the next query so it can be ignored here
                CheckErr("a repost cannot be quoted");
        }

        let result;
        try {
            result = await db.query(named("INSERT INTO posts (publisher,text,image_count,replying_to,repost) VALUES (:user_id, :text,:image_count,:replying_to,:quoted) RETURNING id")(
                {
                    user_id: req.user.id,
                    text: text,
                    image_count: files ? files.length : 0,
                    replying_to: replying_to,
                    quoted: quoted
                }
            ));
        }
        catch (err) {
            if (err.constraint === "replying_to_fkey" || err.constraint === "posts_repost_fkey")
                CheckErr("this post does not exists");
            throw (err);
        }

        const post_id = result.rows[0].id;

        //upload files
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
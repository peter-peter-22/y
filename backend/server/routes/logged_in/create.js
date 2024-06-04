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
import { postQuery } from "./general.js";

const router = express.Router();

router.post("/post", async (req, res, next) => {
    //db
    async function postToDatabase(user_id, text, image_count) {
        const result = await db.query(named("INSERT INTO posts (publisher,text,image_count) VALUES (:user_id, :text,:image_count) RETURNING id")(
            {
                user_id: user_id,
                text: text,
                image_count: image_count,
            }
        ));
        return result;
    }

    await postAny(req, res, next, postToDatabase);
});

router.post("/comment", async (req, res, next) => {
    //additional validations
    const v = new Validator(req.body, {
        replying_to: "required|integer"
    });
    await CheckV(v);
    const { replying_to } = req.body;

    //db
    async function commentToDatabase(user_id, text, image_count) {
        try {
            const getRepliedPublisher = "(SELECT publisher FROM POSTS WHERE id=:replying_to)";
            const result = await db.query(named(`
            INSERT INTO posts 
            (publisher,text,image_count,replying_to,replying_to_publisher) 
            VALUES (:user_id, :text,:image_count,:replying_to,${getRepliedPublisher}) 
            RETURNING id`)
                (
                    {
                        user_id: user_id,
                        text: text,
                        image_count: image_count,
                        replying_to: replying_to
                    }
                ));
            return result;
        }
        catch (err) {
            if (err.constraint === "replying_to_fkey")
                CheckErr("this post does not exists");
            throw (err);
        }
    }

    await postAny(req, res, next, commentToDatabase);
});

router.post("/quote", async (req, res, next) => {
    //additional validations
    const v = new Validator(req.body, {
        quoted: "required|integer"
    });
    await CheckV(v);
    const { quoted } = req.body;

    //check if the selected post can be quoted
    //if the quoted post does not exists, the constraint will throw an error in the next query so it can be ignored here
    const quote_query = await db.query(named("select exists(select * from posts where id=:post_id and repost is not null and text is null) as contains_repost")({ post_id: quoted }));
    if (quote_query.rowCount !== 0 && quote_query.rows[0].contains_repost)
        CheckErr("a repost cannot be quoted");

    //db
    async function commentToDatabase(user_id, text, image_count) {
        try {
            const getQuotedUser=`(SELECT publisher FROM POSTS WHERE id=:quoted)`;
            const result = await db.query(named(`
            INSERT INTO posts 
            (publisher,text,image_count,repost,reposted_from_user) 
            VALUES (:user_id, :text,:image_count,:quoted,${getQuotedUser}) 
            RETURNING id`)
            (
                {
                    user_id: user_id,
                    text: text,
                    image_count: image_count,
                    quoted: quoted
                }
            ));
            return result;
        }
        catch (err) {
            if (err.constraint === "posts_repost_fkey")
                CheckErr("this post does not exists");
            throw (err);
        }
    }

    await postAny(req, res, next, commentToDatabase);
});


async function postAny(req, res, next, saveToDatabase) {
    try {
        //get files and validate inputs
        const files = await getAndValidatePost(req);

        //upload to database
        const { text } = req.body;
        const result = await saveToDatabase(req.user.id, text, files ? files.length : 0);//must return the id of the published post
        const post_id = result.rows[0].id;

        //upload files
        uploadPostFiles(files, post_id);

        //return the created post to client
        const recentlyAddedPost = await postQuery(req, undefined, " WHERE post.id=:post_id", { post_id: post_id }, undefined, 1);
        res.send(recentlyAddedPost[0]);
    }
    catch (err) {
        next(err);
    }
}


async function getAndValidatePost(req) {
    const v = new Validator(req.body, {
        text: "required|string|maxLength:"+req.session.maxLetters
    });
    await CheckV(v);

    const files = getAndValidateFiles(req);
    return files;
}

function uploadPostFiles(files, post_id) {
    if (files !== undefined)
        files.forEach((file, index) => {
            file.mv(config.__dirname + "/public/images/posts/" + post_id + "_" + index + ".jpg");
        });
}

function getAndValidateFiles(req) {
    const files = tryGetFiles(req, "images");
    if (files !== undefined)
        files.forEach(file => {
            validate_image(file);
        });
    return files;
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

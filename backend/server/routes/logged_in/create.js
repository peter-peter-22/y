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
import * as g from "../../config.js";
import * as pp from "../../components/passport.js";
import { username_exists, selectable_username } from "../user.js";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr, validate_image, validate_video, validate_media } from "../../components/validations.js";
import { GetPosts } from "../../components/general_components.js";
import { GetMaxLetters } from "../user.js";
import { uploadMedia } from "../../components/cloudinary_handler.js";
import { findHashtags, findHtml } from "../../components/sync.js";
import { notifyUser, commentPush,repostPush } from "../web_push.js";

const router = express.Router();

router.post("/post", async (req, res) => {
    //db
    async function postToDatabase(baseCols, baseRefs, baseVals) {
        const result = await db.query(named(`INSERT INTO posts (${baseCols}) VALUES (${baseRefs}) RETURNING id`)(
            baseVals
        ));
        return result;
    }

    await postAny(req, res, postToDatabase);
});

router.post("/comment", async (req, res) => {
    //additional validations
    const v = new Validator(req.body, {
        replying_to: "required|integer"
    });
    await CheckV(v);
    const { replying_to } = req.body;

    //db
    async function commentToDatabase(baseCols, baseRefs, baseVals) {
        try {
            //insert and return
            const result = await db.query(named(`
            INSERT INTO posts 
            (${baseCols},replying_to) 
            VALUES (${baseRefs},:replying_to) 
            RETURNING id`
            )(
                {
                    ...baseVals,
                    replying_to: replying_to
                }
            ));

            //send push
            const comment_id = result.rows[0].id;
            commentPush(req.user, comment_id, replying_to);

            return result;
        }
        catch (err) {
            if (err.constraint === "replying_to_fkey")
                CheckErr("this post does not exists");
            throw (err);
        }
    }

    //handle post
    await postAny(req, res, commentToDatabase);
});

router.post("/quote", async (req, res) => {
    //additional validations
    const v = new Validator(req.body, {
        quoted: "required|integer"
    });
    await CheckV(v);
    const { quoted } = req.body;

    //db
    async function quoteToDatabase(baseCols, baseRefs, baseVals) {
        try {
            //insert and return
            const result = await db.query(named(`
            INSERT INTO posts 
            (${baseCols},repost) 
            VALUES (${baseRefs},:quoted) 
            RETURNING id`
            )(
                {
                    ...baseVals,
                    quoted: quoted
                }
            ));

            //send push
            const quote_id = result.rows[0].id;
            repostPush(req.user, quote_id, quoted);

            return result;
        }
        catch (err) {
            if (err.constraint === "posts_repost_fkey")
                CheckErr("this post does not exists");
            throw (err);
        }
    }

    await postAny(req, res, quoteToDatabase);
});


async function postAny(req, res, saveToDatabase) {
    //get files and validate inputs
    const files = await getAndValidatePost(req);

    //upload to database
    let { text } = req.body;

    //remove html from text 
    text = CleanText(text);


    //the values those are sent to all kinds of posts
    const user_id = UserId(req);
    const baseCols = "PUBLISHER, TEXT";
    const baseRefs = ":user_id, :text";
    const baseVals = { user_id: user_id, text: text };

    const result = await saveToDatabase(baseCols, baseRefs, baseVals);//must return the id of the published post
    const post_id = result.rows[0].id;

    //find hashtags in text
    const hashtags = FindHashtags(text);
    //upload hashtags to their table
    await UploadHashtags(post_id, hashtags);

    if (files) {
        //upload files and return the post
        const filedatas = await uploadPostFiles(files, post_id);
        await db.query(named(`
            UPDATE posts 
            SET media=:media 
            WHERE id=:post_id`
        )({
            post_id: post_id,
            media: filedatas
        })
        );
    }
    //return the created post to client
    const recentlyAddedPost = await GetPosts(user_id, "WHERE post.id=:post_id", { post_id: post_id }, 1);
    res.send(recentlyAddedPost[0]);
}

async function UploadHashtags(post_id, hashtags) {
    if (hashtags.length === 0)
        return;

    await db.query(named(`
    INSERT INTO hashtags
    (post_id, hashtag)
    SELECT :post_id, UNNEST(:hashtags::VARCHAR[]) 
    ON CONFLICT ON CONSTRAINT hashtag_unique DO NOTHING
    `)({
        post_id: post_id,
        hashtags: hashtags
    }));
}

function CleanText(text) {
    return text.replace(findHtml, '');
}

function FindHashtags(text) {
    const hashtags = [];
    text.replace(findHashtags, (found) => {
        hashtags.push(found.substring(1, found.length));
    });
    return hashtags;
}

async function getAndValidatePost(req) {
    if (!Array.isArray(req.body.hashtags))
        req.body.hashtags = [req.body.hashtags];

    const v = new Validator(req.body, {
        text: "required|string|maxLength:" + GetMaxLetters(req.user)
    });
    await CheckV(v);

    const files = getAndValidateFiles(req);
    return files;
}

async function uploadPostFiles(files, post_id) {
    const fileDatas = [];
    for (let n = 0; n < files.length; n++) {
        const folder = `posts/${post_id}`;
        const fileName = n;
        const file = files[n];
        const fileData = await uploadMedia(file, fileName, folder);
        fileDatas.push(fileData);
    }
    return fileDatas;
}

function getAndValidateFiles(req) {
    //both images and videos
    const medias = tryGetFiles(req, "medias");
    if (!medias)
        return;

    medias.forEach(media => {
        validate_media(media);
    });
    return medias;
}

//convert the files to array even if there is only one
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

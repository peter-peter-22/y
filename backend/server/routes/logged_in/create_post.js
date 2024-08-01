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
import { uploadPostFiles } from "../../components/cloudinary_handler.js";
import { findHashtags, findHtml } from "../../components/sync.js";
import { notifyUser, commentPush, repostPush } from "../web_push.js";

const router = express.Router();

router.post("/post", async (req, res) => {
    //db
    async function postToDatabase(baseCols, baseRefs, baseVals) {
        const result = await db.query(named(`INSERT INTO posts (${baseCols}) VALUES (${baseRefs}) RETURNING id`)(
            baseVals
        ));
        return result;
    }

    const post = await postAny(req, postToDatabase);
    res.json(post);
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
    const post = await postAny(req, commentToDatabase);
    res.json(post);
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

    const post = await postAny(req, quoteToDatabase);
    res.json(post);
});


async function postAny(req, saveToDatabase) {
    //get files and validate inputs
    await validatePost(req);
    const files = getAndValidateFiles(req);

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

    //get the hashtags of the post and upload them to their separate table
    //could this be skipped by putting a trigger with regex into sql?
    await FindAndUploadHashtag(text, post_id)

    //upload the files of the post to the cloud then add the returned file data to the post
    await UploadFiles(files, post_id);

    //return the created post 
    const recentlyAddedPost = await GetPosts(user_id, "WHERE post.id=:post_id", { post_id: post_id }, 1);//this can be skipped by returning the updated post after cloud upload
    return recentlyAddedPost[0];
}

async function UploadFiles(files, post_id) {
    if (files) {
        //upload files and return the post
        const filedatas = await uploadPostFiles(files, post_id);
        await db.query(named(`
            UPDATE posts 
            SET media=:media||media 
            WHERE id=:post_id`
        )({
            post_id: post_id,
            media: filedatas
        })
        );
    }
}

async function FindAndUploadHashtag(text, post_id) {
    //find hashtags in text
    const hashtags = FindHashtags(text);
    //upload hashtags to their table
    await UploadHashtags(post_id, hashtags);
}

async function UploadHashtags(post_id, hashtags) {
    //delete existing hastags
    await db.query("delete from hashtags where post_id=$1", [post_id]);

    //if no hashtags, exit
    if (hashtags.length === 0)
        return;

    //upload hashtags
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
    //remove html from text to prevent abusing the html displayer of the posts
    return text.replace(findHtml, '');
}

function FindHashtags(text) {
    const hashtags = [];
    text.replace(findHashtags, (found) => {
        hashtags.push(found.substring(1, found.length));
    });
    return hashtags;
}

async function validatePost(req) {
    const v = new Validator(req.body, {
        text: validateText(req.user)
    });
    await CheckV(v);
}

function validateText(user) {
    return "required|string|maxLength:" + GetMaxLetters(user);
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
}

export default router;
export { postAny };

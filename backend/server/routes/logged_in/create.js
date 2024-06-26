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
import  {postQuery} from "../../components/general_components.js";
import { GetMaxLetters } from "../user.js";
import { uploadMedia } from "../../components/cloudinary_handler.js";

const router = express.Router();

router.post("/post", async (req, res) => {
    //db
    async function postToDatabase(user_id, text) {
        const result = await db.query(named("INSERT INTO posts (publisher,text) VALUES (:user_id, :text) RETURNING id")(
            {
                user_id: user_id,
                text: text
            }
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
    async function commentToDatabase(user_id, text, media) {
        try {
            const getRepliedPublisher = "(SELECT publisher FROM POSTS WHERE id=:replying_to)";
            const result = await db.query(named(`
            INSERT INTO posts 
            (publisher,text,replying_to,replying_to_publisher) 
            VALUES (:user_id, :text,:replying_to,${getRepliedPublisher}) 
            RETURNING id`)
                (
                    {
                        user_id: user_id,
                        text: text,
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

    await postAny(req, res, commentToDatabase);
});

router.post("/quote", async (req, res) => {
    //additional validations
    const v = new Validator(req.body, {
        quoted: "required|integer"
    });
    await CheckV(v);
    const { quoted } = req.body;

    //check if the selected post can be quoted
    //if the quoted post does not exists, the constraint will throw an error in the next query so it can be ignored here
    const quote_query = await db.query(named(`
        select exists
        (
            select * from posts 
            where id=:post_id 
            and 
            repost is not null 
            and 
            text is null
        ) 
        as contains_repost`)
        ({ post_id: quoted }));

    if (quote_query.rowCount !== 0 && quote_query.rows[0].contains_repost)
        CheckErr("a repost cannot be quoted");

    //db
    async function quoteToDatabase(user_id, text, media) {
        try {
            const getQuotedUser = `(SELECT publisher FROM POSTS WHERE id=:quoted)`;
            const result = await db.query(named(`
            INSERT INTO posts 
            (publisher,text,media,repost,reposted_from_user) 
            VALUES (:user_id, :text,:media,:quoted,${getQuotedUser}) 
            RETURNING id`)
                (
                    {
                        user_id: user_id,
                        text: text,
                        ...media,
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

    await postAny(req, res, quoteToDatabase);
});


async function postAny(req, res, saveToDatabase) {
    //get files and validate inputs
    const files = await getAndValidatePost(req);

    //upload to database
    const { text } = req.body;
    const result = await saveToDatabase(req.user.id, text);//must return the id of the published post
    const post_id = result.rows[0].id;

    if (files) {
        //upload files and return the post
        const filedatas = await uploadPostFiles(files, post_id);
        await db.query(named(`
            UPDATE posts 
            SET media=:media 
            WHERE id=:post_id`
        )
            ({
                post_id: post_id,
                media: filedatas
            })
        );
    }
    //return the created post to client
    const recentlyAddedPost = await postQuery(req, undefined, " WHERE post.id=:post_id", { post_id: post_id }, undefined, 1);
    res.send(recentlyAddedPost[0]);
}

async function getAndValidatePost(req) {
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

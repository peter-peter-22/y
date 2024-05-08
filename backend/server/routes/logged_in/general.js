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
import { CheckV, CheckErr } from "../../components/validations.js";
import { ApplySqlToUser, UpdateUser } from "../logged_in.js";

const router = express.Router();

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

router.post("/get_post", async (req, res, next) => {
    const v = new Validator(req.body, {
        id: 'required|integer',
    });
    await CheckV(v);
    const { id } = req.body;
    const posts = await postQuery(req, next, " WHERE post.id=:id", { id: id });
    const main_post = posts[0];
    const comments = await postQuery(req, next, " WHERE replying_to=:id", { id: id });
    if (posts.length > 0)
        res.send(main_post);
    else
        res.status(400).send("This post does not exists");
});

async function postQuery(req, next, where, where_params) {
    //select post.text,
    //post.id,
    //post.image_count, 
    //post.date, 
    //post.repost as reposted_from,
    //(select count(*) from likes where likes.post_id=post.id)::INT as like_count, 
    //EXISTS(select * from likes where likes.post_id=post.id AND user_id=:user_id) as liked_by_user,
    //(select count(*) from posts reposts_query where reposts_query.repost=post.id)::INT as repost_count, 
    //(select count(*) from bookmarks bookmark where bookmark.post_id=post.id)::INT as bookmark_count,
    //EXISTS(select * from bookmarks bookmark where bookmark.post_id=post.id AND bookmark.user_id=post.publisher) as bookmarked_by_user,
    //poster.id as poster_id,
    //poster.name as poster_name,
    //poster.username as poster_username 
    //from posts post 
    //left join users poster on post.publisher=poster.id

    try {
        const user_id = req.user.id;

        let text = "select post.text, post.id, post.image_count, post.date, post.repost as reposted_from, (select count(*) from likes where likes.post_id=post.id)::INT as like_count, EXISTS(select * from likes where likes.post_id=post.id AND user_id=:user_id) as liked_by_user, (select count(*) from posts reposts_query where reposts_query.repost=post.id)::INT as repost_count, (select count(*) from bookmarks bookmark where bookmark.post_id=post.id)::INT as bookmark_count, EXISTS(select * from bookmarks bookmark where bookmark.post_id=post.id AND bookmark.user_id=post.publisher) as bookmarked_by_user, poster.id as poster_id, poster.name as poster_name, poster.username as poster_username from posts post left join users poster on post.publisher=poster.id";
        if (where !== undefined)
            text += where;

        let params = { user_id: user_id };
        if (params)
            params = { ...where_params, ...params };

        const result = await db.query(named(text)(params));
        return result.rows;
    }
    catch (err) {
        next(err);
    }
}

router.post("/like", async (req, res) => {
    await CountableToggle(req, res, "likes", "unique_likes");
});

router.post("/bookmark", async (req, res) => {
    await CountableToggle(req, res, "bookmarks", "unique_bookmarks");
});

async function CountableToggle(req, res, table, unique_constraint_name) {
    const v = new Validator(req.body, {
        post: 'required|integer',
        value: "required|boolean"
    });
    await CheckV(v);
    const { post, value } = req.body;
    if (value)
        await db.query(named("INSERT INTO " + table + " (user_id, post_id) VALUES (:user,:post) ON CONFLICT ON CONSTRAINT " + unique_constraint_name + " DO NOTHING")({ user: req.user.id, post: post }));
    else
        await db.query(named("DELETE FROM " + table + " WHERE user_id=:user AND post_id=:post")({ user: req.user.id, post: post }));
    res.sendStatus(200);
}

export default router;
export { postQuery };
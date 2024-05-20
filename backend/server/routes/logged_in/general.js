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

router.post("/follow_user", async (req, res, next) => {
    await CountableToggle(req, res, next, "follows", "follow_unique", "follower", "followed");
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
    const posts = await postQuery(req, next, undefined, " WHERE post.id=:id", { id: id });
    if (posts.length > 0)
        res.send(posts[0]);
    else
        res.status(400).send("This post does not exists");
});
router.post("/get_comments", async (req, res, next) => {
    const v = new Validator(req.body, {
        id: 'required|integer',
        from: 'required|integer'
    });
    await CheckV(v);
    const { id, from } = req.body;
    const comments = await postQuery(req, next, undefined, " WHERE replying_to=:id OFFSET :from LIMIT 5", { id: id, from: from });
    res.send(comments);
});

router.post("/get_bookmarks", async (req, res, next) => {
    const v = new Validator(req.body, {
        from: 'required|integer'
    });
    await CheckV(v);
    const { from } = req.body;
    const comments = await postQuery(req, next, "SELECT * FROM (", ") as subquery WHERE bookmarked_by_user=TRUE OFFSET :from LIMIT 5", { from: from });
    res.send(comments);
});


router.post("/follower_recommendations", async (req, res, next) => {
    const v = new Validator(req.body, {
        from: 'required|integer'
    });
    await CheckV(v);
    const { from } = req.body;
    const result = await db.query(named("SELECT * FROM ( SELECT ID, USERNAME, NAME, EXISTS (SELECT * FROM FOLLOWS WHERE FOLLOWER = 50 AND FOLLOWED = ID) AS IS_FOLLOWED FROM USERS OFFSET :from LIMIT 10 ) as sq WHERE IS_FOLLOWED=FALSE")({ from: from, user_id: req.user.id }))
    res.send(result.rows);
});



async function postQuery(req, next, before, after, additional_params) {
    try {
        const user_id = req.user.id;

        let text = "select post.text, post.id, post.image_count, post.date, post.views, post.repost as reposted_from, (select count(*) from likes where likes.post_id=post.id)::INT as like_count, EXISTS(select * from likes where likes.post_id=post.id AND user_id=50) as liked_by_user, (select count(*) from posts reposts_query where reposts_query.repost=post.id)::INT as repost_count, (select count(*) from bookmarks bookmark where bookmark.post_id=post.id)::INT as bookmark_count, EXISTS(select * from bookmarks bookmark where bookmark.post_id=post.id AND bookmark.user_id=post.publisher) as bookmarked_by_user, poster.id as poster_id, poster.name as poster_name, poster.username as poster_username, 	(SELECT count(*) from posts as comments_table where comments_table.replying_to = post.id) as comment_count from posts post left join users poster on post.publisher=poster.id";
        if (after !== undefined)
            text += after;
        if (before !== undefined)
            text = before + text;

        let params = { user_id: user_id };
        if (additional_params)
            params = { ...params, ...additional_params };

        const result = await db.query(named(text)(params));
        updateViews(result.rows);//the viewcount update is not awaited
        return result.rows;
    }
    catch (err) {
        next(err);
    }
}

async function updateViews(posts) {
    const ids = posts.map((post) => post.id);
    await db.query(named("UPDATE posts SET views = views + 1 WHERE id=ANY(:post_ids)")({ post_ids: ids }));
}

router.post("/like", async (req, res, next) => {
    await CountableToggle(req, res, next, "likes", "unique_likes");
});

router.post("/bookmark", async (req, res, next) => {
    await CountableToggle(req, res, next, "bookmarks", "unique_bookmarks");
});

async function CountableToggle(req, res, next, table, unique_constraint_name, first_column_name = "user_id", second_column_name = "post_id") {
    try {
        const v = new Validator(req.body, {
            key: 'required|integer',
            value: "required|boolean"
        });
        await CheckV(v);
        const { key, value } = req.body;
        try {
            if (value)
                await db.query(named("INSERT INTO " + table + " (" + first_column_name + ", " + second_column_name + ") VALUES (:user,:key) ON CONFLICT ON CONSTRAINT " + unique_constraint_name + " DO NOTHING")({ user: req.user.id, key: key }));
            else
                await db.query(named("DELETE FROM " + table + " WHERE " + first_column_name + "=:user AND " + second_column_name + "=:key")({ user: req.user.id, key: key }));
            res.sendStatus(200);
        }
        catch (err) {
            CheckErr(err);
        }
    }
    catch (err) {
        next(err);
    }
}

export default router;
export { postQuery };
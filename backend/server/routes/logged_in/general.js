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
    await post_list(req, res, next, { id: 'required|integer' }, undefined, " WHERE post.id=:id", { id: req.body.id });
});

router.post("/get_comments", async (req, res, next) => {
    await post_list(req, res, next, { id: 'required|integer' }, undefined, " WHERE replying_to=:id", { id: req.body.id });
});

router.post("/posts_of_user", async (req, res, next) => {
    await post_list(req, res, next, { user_id: "required|integer" }, undefined, " WHERE post.publisher=:target_user_id AND post.replying_to IS NULL", { target_user_id: req.body.user_id });
});

router.post("/comments_of_user", async (req, res, next) => {
    await post_list(req, res, next, { user_id: "required|integer" }, undefined, " WHERE post.publisher=:target_user_id  AND post.replying_to IS NOT NULL", { target_user_id: req.body.user_id });
});

router.post("/get_bookmarks", async (req, res, next) => {
    await post_list(req, res, next, undefined, "SELECT * FROM (", ") as subquery WHERE bookmarked_by_user=TRUE");
});

async function post_list(req, res, next, add_validations, before, after, query_params) {
    try {
        let validations = { from: "required|integer" };
        if (add_validations)
            validations = { ...validations, ...add_validations };
        const v = new Validator(req.body, validations);
        await CheckV(v);

        const { from } = req.body;
        const comments = await postQuery(req, next, before, after, query_params, undefined,undefined,from);
        res.send(comments);
    }
    catch (err) {
        next(err);
    }
}


router.post("/follower_recommendations", async (req, res, next) => {
    const v = new Validator(req.body, {
        from: 'required|integer'
    });
    await CheckV(v);
    const { from } = req.body;
    const users = await user_query(req, next, undefined, " WHERE IS_FOLLOWED=FALSE OFFSET :from", { from: from });
    res.send(users);
});

router.get("/follower_recommendations_preview", async (req, res, next) => {
    const users = await user_query(req, next, undefined, " WHERE IS_FOLLOWED=FALSE", undefined, 3);
    res.send(users);
});

router.post("/repost", async (req, res) => {
    const v = new Validator(req.body, {
        key: 'required|integer',
        value: "required|boolean"
    });
    await CheckV(v);
    const { key: reposted_post_id, value: set_respost } = req.body;
    const user_id = req.user.id;
    try {
        if (set_respost) {
            const validation = await db.query(named("select exists(select * from posts where id=:post_id and repost is not null and text is null) as is_a_repost")({ post_id: reposted_post_id, user_id: user_id }));
            if (validation.rowCount !== 0) {//if the reposted post does not exists, the constraint will throw an error in the next query so it can be ignored here
                const tests = validation.rows[0];
                if (tests.is_a_repost)
                    throw ("a repost cannot be reposted");
            }

            try {
                await db.query(named("INSERT INTO POSTS (PUBLISHER,REPOST) SELECT :user_id,:post_id WHERE NOT EXISTS (SELECT * FROM POSTS WHERE PUBLISHER = :user_id AND REPOST = :post_id) AND NOT EXISTS (SELECT * FROM POSTS WHERE ID = :post_id AND REPOST IS NOT NULL AND text IS NULL)")({ user_id: user_id, post_id: reposted_post_id }));
            }
            catch (err) {
                if (err.constraint === "posts_repost_fkey")
                    throw new Error("this post does not exists");
                if (err.constraint === "unique_repost") {
                    //ignore to prevent error message in strictmode
                } else
                    throw (err);
            }
        }
        else
            await db.query(named("DELETE FROM posts WHERE publisher=:user_id AND repost=:post_id")({ user_id: user_id, post_id: reposted_post_id }));
        res.sendStatus(200);
    }
    catch (err) {
        CheckErr(err);
    }
});

async function user_query(req, next, before, after, additional_params, limit) {
    try {
        const text = "SELECT * FROM ( SELECT ID, USERNAME, NAME, EXISTS (SELECT * FROM FOLLOWS WHERE FOLLOWER = :user_id AND FOLLOWED = ID) AS IS_FOLLOWED FROM USERS  ) as sq";
        if (limit === undefined)
            limit = config.users_per_request;
        if (after === undefined)
            after = "";
        after += " LIMIT :limit"
        const params = { user_id: req.user.id, limit: limit };
        const users = await editable_query(text, before, after, params, additional_params);
        return users;
    }
    catch (err) {
        next(err);
    }
}

async function editable_query(text, before, after, params, additional_params) {
    if (after !== undefined)
        text += after;
    if (before !== undefined)
        text = before + text;
    if (additional_params)
        params = { ...params, ...additional_params };

    const result = await db.query(named(text)(params));
    return result.rows;
}

async function postQuery(req, next, before, after, additional_params, level = 0, limit, offset = 0) {
    try {
        const text = "SELECT POST.TEXT, POST.ID, POST.IMAGE_COUNT, POST.DATE, POST.VIEWS, POST.REPOST AS REPOSTED_ID, (SELECT COUNT(*) FROM LIKES WHERE LIKES.POST_ID = POST.ID)::INT AS LIKE_COUNT, EXISTS (SELECT * FROM LIKES WHERE LIKES.POST_ID = POST.ID AND USER_ID = :user_id) AS LIKED_BY_USER, (SELECT COUNT(*) FROM POSTS REPOSTS WHERE REPOSTS.REPOST = POST.ID)::INT AS REPOST_COUNT, EXISTS( SELECT * FROM POSTS REPOSTS WHERE REPOSTS.REPOST = POST.ID AND REPOSTS.TEXT IS NULL AND REPOSTS.PUBLISHER=:user_id) AS REPOSTED_BY_USER, (SELECT COUNT(*) FROM BOOKMARKS BOOKMARK WHERE BOOKMARK.POST_ID = POST.ID)::INT AS BOOKMARK_COUNT, EXISTS (SELECT * FROM BOOKMARKS BOOKMARK WHERE BOOKMARK.POST_ID = POST.ID AND BOOKMARK.USER_ID = :user_id) AS BOOKMARKED_BY_USER, POSTER.ID AS POSTER_ID, POSTER.NAME AS POSTER_NAME, POSTER.USERNAME AS POSTER_USERNAME, (SELECT COUNT(*) FROM POSTS AS COMMENTS_TABLE WHERE COMMENTS_TABLE.REPLYING_TO = POST.ID)::INT AS COMMENT_COUNT FROM (SELECT * FROM POSTS ORDER BY POSTS.DATE DESC) POST LEFT JOIN USERS POSTER ON POST.PUBLISHER = POSTER.ID";
        if (limit === undefined)
            limit = config.posts_per_request;
        if (after === undefined)
            after = "";
        after += " OFFSET :offset LIMIT :limit"
        const params = { user_id: req.user.id, limit: limit, offset: offset };
        const posts = await editable_query(text, before, after, params, additional_params);

        //the reposted posts must be downloaded and added to their reposters
        //level means how much parent posts are above this post
        if (level < 2) {
            //getting the ids of the reposted posts
            const reposted_ids = [];
            posts.forEach(post => {
                if (post.reposted_id !== null) {
                    reposted_ids.push(post.reposted_id);
                }
            });
            if (reposted_ids.length !== 0) {
                //downloading the reposted posts and assigning them to their reposter
                const reposted_posts = await postQuery(req, (err) => { throw (err) }, undefined, " WHERE post.id=ANY(:reposted_ids)", { reposted_ids: reposted_ids }, level + 1);

                posts.forEach(post => {
                    if (post.reposted_id !== null) {
                        const my_reposted_post = reposted_posts.find(reposted => post.reposted_id === reposted.id);
                        if (my_reposted_post === undefined)
                            throw new Error("failed to download the reposted post");
                        post.reposted_post = my_reposted_post;
                    }
                })
            }
        }

        updateViews(posts);//the viewcount update is not awaited

        return posts;
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

async function CountableToggle(req, res, next, table, unique_constraint_name, first_column_name = "user_id", second_column_name = "post_id",) {
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
export { postQuery, post_list };
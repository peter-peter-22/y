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
import postQueryText, { is_followed, is_blocked, user_columns_basic, user_columns_extended } from "./post_query.js";

const router = express.Router();

router.post("/follow_user", async (req, res) => {
    await CountableToggleSimplified(req, res, "follows", "follow_unique", "follower", "followed");
});

router.post("/block_user", async (req, res) => {
    await CountableToggleSimplified(req, res, "blocks", "unique_blocks", "blocker", "blocked");
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

router.post("/get_post", async (req, res) => {
    const v = new Validator(req.body, {
        id: 'required|integer',
    });
    await CheckV(v);
    const { id } = req.body;
    const posts = await postQuery(req, undefined, " WHERE post.id=:id", { id: id }, undefined, 1);
    const post = posts[0];
    if (post === undefined)
        CheckErr("this post does not exists");
    res.send(post);
});

router.post("/get_comments", async (req, res) => {
    await post_list(req, res, { id: 'required|integer' }, undefined, " WHERE replying_to=:id", { id: req.body.id });
});

router.post("/posts_of_user", async (req, res) => {
    await post_list(req, res, { user_id: "required|integer" }, undefined, " WHERE post.publisher=:target_user_id AND post.replying_to IS NULL", { target_user_id: req.body.user_id });
});

router.post("/reposts_of_post", async (req, res) => {
    await post_list(req, res, { post_id: "required|integer" }, undefined, " WHERE post.repost=:post_id AND TEXT IS NULL", { post_id: req.body.post_id });
});

router.post("/quotes_of_post", async (req, res) => {
    await post_list(req, res, { post_id: "required|integer" }, undefined, " WHERE post.repost=:post_id AND TEXT IS NOT NULL", { post_id: req.body.post_id });
});

router.post("/comments_of_user", async (req, res) => {
    await post_list(req, res, { user_id: "required|integer" }, undefined, " WHERE post.publisher=:target_user_id AND post.replying_to IS NOT NULL", { target_user_id: req.body.user_id });
});

router.post("/likes_of_user", async (req, res) => {
    await post_list(req, res, { user_id: "required|integer" }, undefined, " WHERE EXISTS(select * from likes WHERE likes.post_id=post.id AND post.publisher=:target_user_id)", { target_user_id: req.body.user_id });
});

router.post("/get_bookmarks", async (req, res) => {
    await post_list(req, res, undefined, "SELECT * FROM (", ") as subquery WHERE bookmarked_by_user=TRUE");
});

router.post("/media_of_user", async (req, res) => {
    const v = new Validator(req.body, {
        from: "required|integer",
        user_id: "required|integer"
    });
    await CheckV(v);

    const q = await db.query(named(
        `select id, image_count 
         from posts
         where image_count != 0 and publisher=:target_user_id 
         OFFSET :from LIMIT :limit`
    )({
        target_user_id: req.body.user_id,
        limit: config.posts_per_request,
        from: req.body.from
    }));
    res.send(q.rows);
});

router.post("/user_profile", async (req, res) => {
    const v = new Validator(req.body, {
        user_id: "required|integer"
    });
    await CheckV(v);

    const { user_id } = req.body;
    const q = await db.query(named(`
    select 
    name,
    username,
    id,
    registration_date,
    birthdate,
    bio, 
    ${is_blocked} as is_blocked,
    (select count(*) from follows where followed=id) as followers , 
    (select count(*) from follows where follower=id) as follows 
    from users 
    where id=:target_user_id
    `)({ target_user_id: user_id,user_id:req.user.id }));
    const user = q.rows[0];
    if (!user)
        CheckErr("this user does not exists");
    res.send(user);
});

async function post_list(req, res, add_validations, before, after, query_params) {
    let validations = { from: "required|integer" };
    if (add_validations)
        validations = { ...validations, ...add_validations };
    const v = new Validator(req.body, validations);
    await CheckV(v);

    const { from } = req.body;
    const comments = await postQuery(req, before, after, query_params, undefined, undefined, from);
    res.send(comments);
}


router.post("/follower_recommendations", async (req, res) => {
    const v = new Validator(req.body, { from: "required|integer" });
    await CheckV(v);
    const { from } = req.body;
    const text = `SELECT ${user_columns_basic} from USERS WHERE NOT ${is_followed} LIMIT :limit OFFSET :offset`;
    const users = await db.query(named(text)({
        user_id: req.user.id,
        offset: from,
        limit: config.users_per_request
    }));
    res.send(users.rows);
});

router.post("/likers_of_post", async (req, res) => {
    const v = new Validator(req.body, { from: "required|integer" });
    await CheckV(v);
    const { from, post_id } = req.body;

    const user_liked_the_post = `
    EXISTS(
        SELECT * FROM LIKES
        WHERE
        USER_ID=USERS.ID
        AND
        POST_ID=:post_id
    )`;

    const text = `
    SELECT 
    ${user_columns_basic},
    ${is_followed} AS IS_FOLLOWED,
    USERS.BIO 
    from USERS 
    WHERE ${user_liked_the_post} 
    LIMIT :limit OFFSET :offset`;

    const users = await db.query(named(text)({
        user_id: req.user.id,
        offset: from,
        limit: config.users_per_request,
        post_id: post_id
    }));

    res.send(users.rows);
});

router.post("/viewers_of_post", async (req, res) => {
    await user_list(req, res, undefined, undefined, " WHERE IS_FOLLOWED=FALSE");
});


router.get("/follower_recommendations_preview", async (req, res) => {
    const text = `SELECT ${user_columns_basic} from USERS WHERE NOT ${is_followed} LIMIT 3`;
    const users = await db.query(named(text)({ user_id: req.user.id }));
    res.send(users.rows);
});

router.post("/repost", async (req, res) => {

    //create repost
    async function onAdd(reposted_post_id, user_id) {
        //check if this post can be reposted
        //if the reposted post does not exists, the constraint will throw an error in the next query so it can be ignored here
        const validation = await db.query(named("select exists(select * from posts where id=:post_id and repost is not null and text is null) as is_a_repost")({ post_id: reposted_post_id, user_id: user_id }));
        if (validation.rowCount !== 0) {
            const tests = validation.rows[0];
            if (tests.is_a_repost)
                throw ("a repost cannot be reposted");
        }

        //insert
        try {
            const getRepostedUser = `(SELECT publisher FROM POSTS WHERE id=:post_id)`;
            await db.query(named(`
            INSERT INTO POSTS (PUBLISHER,REPOST,REPOSTED_FROM_USER)
            SELECT :user_id,:post_id,${getRepostedUser} WHERE 
            NOT EXISTS 
            (SELECT * FROM POSTS WHERE PUBLISHER = :user_id AND REPOST = :post_id)
            AND NOT EXISTS 
            (SELECT * FROM POSTS WHERE ID = :post_id AND REPOST IS NOT NULL AND text IS NULL)`)({ user_id: user_id, post_id: reposted_post_id }));
        }
        catch (err) {
            if (err.constraint === "posts_repost_fkey")
                throw new Error("this post does not exists");
            if (err.constraint === "unique_repost") {
                //ignore
            } else
                throw (err);
        }
    }

    //delete repost
    async function onRemove(reposted_post_id, user_id) {
        await db.query(named("DELETE FROM posts WHERE publisher=:user_id AND repost=:post_id")({ user_id: user_id, post_id: reposted_post_id }));
    }

    await CountableToggle(req, res, onAdd, onRemove);
});



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

async function postQuery(req, before, after, additional_params, level = 0, limit, offset = 0) {
    //adding the input values to the default values if necessary
    const text = postQueryText;
    if (limit === undefined)
        limit = config.posts_per_request;
    if (after === undefined)
        after = "";
    after += " OFFSET :offset LIMIT :limit"
    const user_id = req.user.id;
    const params = { user_id: user_id, limit: limit, offset: offset };

    //getting the posts
    const posts = await editable_query(text, before, after, params, additional_params);

    //for each comment, getting the name of the replied user
    const comments = posts.filter(post => post.replying_to !== null);
    if (comments.length !== 0) {
        const replied_ids = [];
        comments.forEach(comment => {
            const replied_id = comment.replying_to;
            if (!replied_ids.includes(replied_id))
                replied_ids.push(replied_id);
        });
        const replied_query = await db.query(named("SELECT POST.ID as post_id, POSTER.ID, POSTER.USERNAME, POSTER.NAME FROM POSTS POST LEFT JOIN USERS POSTER ON POSTER.ID = POST.PUBLISHER WHERE POST.ID = ANY(:ids)")({ ids: replied_ids }));
        const replied_users = replied_query.rows;
        comments.forEach(comment => {
            const myUser = replied_users.find(user => user.post_id === comment.replying_to);
            comment.replied_user = myUser;
        });
    }

    //adding the referenced post to each repost or quote
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
            const reposted_posts = await postQuery(req, undefined, " WHERE post.id=ANY(:reposted_ids)", { reposted_ids: reposted_ids }, level + 1);

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

    await updateViews(posts, user_id);//the viewcount update is not awaited

    return posts;
}

async function updateViews(posts, user_id) {
    const ids = posts.map((post) => post.id);
    try {
        await db.query(named(`
    insert into views (post_id, user_id)
    select UNNEST(:post_ids::int[]),:user_id 
    ON CONFLICT ON CONSTRAINT unique_view DO NOTHING
    `)
            ({
                post_ids: ids,
                user_id: user_id
            }));
    }
    catch (err) {
        CheckErr(err);
    }
}

router.post("/like", async (req, res) => {
    async function onAdd(key, user_id) {
        const get_publisher_id = `(SELECT publisher from posts where id=:post_id)`;
        const addLike = `INSERT INTO likes (user_id,post_id,publisher_id) VALUES (:user,:post_id, ${get_publisher_id}) ON CONFLICT ON CONSTRAINT unique_likes DO NOTHING`;
        await db.query(named(addLike)({ user: user_id, post_id: key }));
    }

    async function onRemove(key, user_id) {
        await db.query(named("DELETE FROM likes WHERE user_id=:user AND post_id=:post_id")({ user: user_id, post_id: key }));
    }

    await CountableToggle(req, res, onAdd, onRemove);
});

router.post("/bookmark", async (req, res) => {
    await CountableToggleSimplified(req, res, "bookmarks", "unique_bookmarks");
});

async function CountableToggleSimplified(req, res, table, unique_constraint_name, first_column_name = "user_id", second_column_name = "post_id") {
    async function onAdd(key, user_id) {
        await db.query(named("INSERT INTO " + table + " (" + first_column_name + ", " + second_column_name + ") VALUES (:user,:key) ON CONFLICT ON CONSTRAINT " + unique_constraint_name + " DO NOTHING")({ user: user_id, key: key }));
    }

    async function onRemove(key, user_id) {
        await db.query(named("DELETE FROM " + table + " WHERE " + first_column_name + "=:user AND " + second_column_name + "=:key")({ user: user_id, key: key }));
    }

    await CountableToggle(req, res, onAdd, onRemove);
}

async function CountableToggle(req, res, onAdd, onRemove) {
    const v = new Validator(req.body, {
        key: 'required|integer',
        value: "required|boolean"
    });
    await CheckV(v);
    const { key, value } = req.body;
    const user_id = req.user.id;
    try {
        if (value) {
            await onAdd(key, user_id);
        }
        else
            await onRemove(key, user_id);
        res.sendStatus(200);
    }
    catch (err) {
        CheckErr(err);
    }
}

export default router;
export { postQuery, post_list, CountableToggle };
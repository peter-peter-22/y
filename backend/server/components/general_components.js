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
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr } from "./validations.js";
import postQueryText, { is_followed, is_blocked, user_columns, user_columns_extended } from "./post_query.js";


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

async function post_list(req, res, add_validations, before, after, query_params) {
    let validations = { from: "required|integer" };
    if (add_validations)
        validations = { ...validations, ...add_validations };
    const v = new Validator(req.body, validations);
    await CheckV(v);

    const { from } = req.body;
    const posts = await postQuery(req, before, after, query_params, undefined, undefined, from);
    res.send(posts);
}

export {CountableToggleSimplified,CountableToggle,postQuery,editable_query,updateViews,post_list};
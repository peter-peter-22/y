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
import { postQuery, is_blocked, user_columns, user_columns_extended } from "./post_query.js";


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
    const user_id = UserId(req);
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

async function GetPosts(user_id, where = "", where_params, limit, offset, posts_query, level) {
    const params = { user_id: user_id, ...where_params };

    if (offset !==undefined) {
        if (where)
            where += " and ";
        where += `post.id<${parseInt(offset)}`;
    }

    //getting the posts
    const text = postQuery(where, limit, posts_query);
    const posts_q = await db.query(named(text)(params));
    const posts = posts_q.rows;

    //add other data
    await add_data_to_posts(posts, user_id, level);

    return posts;
}

//adds the necessary data about the replied, reposted and quoted posts and counts the views
async function add_data_to_posts(posts, user_id, level = 0) {
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
            const reposted_posts = await GetPosts(user_id, "WHERE post.id=ANY(:reposted_ids)", { reposted_ids: reposted_ids }, 999, undefined, undefined, level);

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

async function post_list(req, res, add_validations, where, where_params, posts_query) {
    let validations = { from: "required|integer" };
    if (add_validations)
        validations = { ...validations, ...add_validations };
    const v = new Validator(req.body, validations);
    await CheckV(v);

    const { from } = req.body;
    const posts = await GetPosts(UserId(req), where, where_params, undefined, from, posts_query);
    res.json(posts);
}

export { CountableToggleSimplified, CountableToggle, GetPosts, editable_query, updateViews, post_list };
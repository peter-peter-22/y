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
import * as g from "../config.js";
import * as pp from "../components/passport.js";
import { username_exists, selectable_username } from "./user.js";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr } from "../components/validations.js";
import { user_columns } from "../components/post_query.js";

import modify from "./logged_in/modify.js";
import create from "./logged_in/create.js";
import general from "./logged_in/general.js";
import feed from "./logged_in/feed.js";
import notifications from "./logged_in/notifications.js";
import trends from "./logged_in/trends.js";

const router = express.Router();

router.use((req, res, next) => {
    if (pp.auth(req, res))
        next();
});

router.use("/modify", modify);
router.use("/create", create);
router.use("/general", general);
router.use("/feed", feed);
router.use("/notifications", notifications);
router.use("/trends", trends);

async function UpdateUser(newUser, req) {
    return new Promise(resolve => {
        req.logIn(newUser, (err) => {
            if (err)
                throw (err);
            resolve();
        });
    });
}

async function ApplySqlToUser(query_result, req) {
    const user = query_result.rows[0];
    await UpdateUser(user, req);
}

async function UpdateUserAfterChange( req) {
    const q =await db.query(named(`select ${user_columns} from users where id=:id`)({id:UserId(req)}));
    await ApplySqlToUser(q, req);
}

export default router;
export { ApplySqlToUser, UpdateUser,UpdateUserAfterChange };
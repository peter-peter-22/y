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
import * as g from "../global.js";
import * as pp from "../components/passport.js";
import { username_exists, selectable_username } from "./user.js";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr } from "../components/validations.js";
import modify from "./logged_in/modify.js";
import create from "./logged_in/create.js";
import general from "./logged_in/general.js";
import feed from "./logged_in/feed.js";
import notifications from "./logged_in/notifications.js";

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
    await UpdateUser(query_result.rows[0], req);
}

async function UpdateUserAfterChange( req) {
    const q =await db.query(named("select * from users where id=:id")({id:req.user.id}));
    await ApplySqlToUser(q, req);
}

export default router;
export { ApplySqlToUser, UpdateUser,UpdateUserAfterChange };
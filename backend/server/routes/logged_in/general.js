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
import { ApplySqlToUser,UpdateUser } from "../logged_in.js";

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

export default router;
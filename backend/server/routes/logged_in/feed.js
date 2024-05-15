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
import { CheckV, CheckErr, validate_image } from "../../components/validations.js";
import { ApplySqlToUser, UpdateUser } from "../logged_in.js";
import { postQuery } from "./general.js";

const router = express.Router();

router.post("/get_posts", async (req, res, next) => {
    const v = new Validator(req.body, {
        from: 'required|integer',
    });
    await CheckV(v);
    const { from } = req.body;

    const result = await postQuery(req, next, " WHERE post.replying_to IS NULL OFFSET :from LIMIT 5", { from: from });
    res.status(200).send(result);
});


export default router;
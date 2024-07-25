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
import * as g from "../../config.js";
import * as pp from "../../components/passport.js";
import { username_exists, selectable_username } from "../user.js";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr, validate_image, validate_video, validate_media } from "../../components/validations.js";
import { GetPosts } from "../../components/general_components.js";
import { GetMaxLetters } from "../user.js";
import { uploadMedia } from "../../components/cloudinary_handler.js";
import { findHashtags, findHtml } from "../../components/sync.js";
import { notifyUser, commentPush, repostPush } from "../web_push.js";

const router = express.Router();

router.post("/post", async (req, res) => {
    //get and validate body
    const v = new Validator(req.body, {
        id: "required|integer"
    });
    await CheckV(v);
    const { id } = req.body;

    //delete post from db if it belongs to this user
    const q = await db.query(named(`
        delete from posts 
        where id=:post_id
        and publisher=:user_id
        returning id`
    )(
        {
            post_id: id,
            user_id: UserId(req)
        }
    ));

    //the files must be deleted too

    //if no post was deleted, then the post either not exists or it does not belongs to the user
    if (q.rowCount === 0)
        CheckErr("this post either does not exists or does not belongs to the user");

    res.sendStatus(200);
});

export default router;

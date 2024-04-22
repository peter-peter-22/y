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
import { Validator } from "node-input-validator";
import * as g from "../global.js";
import * as pp from "../components/passport.js";

const router = express.Router();

router.post('/exists/email', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await g.db.query(named("SELECT count(*) FROM users WHERE email=:email")({ email: email }));
        if (result.rows[0].count > 0)
            return res.sendStatus(200);
        else
            return res.sendStatus(400);
    }
    catch (err) {
        res.sendStatus(500);
        console.log(err);
    }
});

export default router;
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
env.config();
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";

const app= express();

const config = {
    port: 3000,
    saltRounds: 10,
    __dirname: dirname(fileURLToPath(import.meta.url)),
    server_url: process.env.SERVER_URL,
    client_url: process.env.CLIENT_URL,
    google_rechapta_secret_key: process.env.GOOGLE_RECHAPTA_SECRET,
    google_login_redirect: "/login/google",
    cookie_remember: 1000 * 60 * 60 * 24 * 30,//1 month. the user most log in at least once within a month to prevent logout
    cookie_registering: 1000 * 60 * 60 * 2,//2 hours. the email, name, ect. the user sends at the start of the registration must be finalized within 2 hour
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
await db.connect();

const pgPool = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

global.app=app;
global.db = db;
global.config=config;
export { transporter, pgPool};
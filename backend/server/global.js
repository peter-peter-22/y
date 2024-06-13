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
env.config();
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";
import Moment from "moment";

const app = express();

const address_modes = {
    localhost: {
        server: process.env.SERVER_URL_LOCALHOST,
        client: process.env.CLIENT_URL_LOCALHOST,
        pg: process.env.PG_HOST_LOCALHOST,
    },
    dev: {
        server: process.env.SERVER_URL_DEV,
        client: process.env.CLIENT_URL_DEV,
        pg: process.env.PG_HOST_DEV,
    }
}

const all_clients = Object.values(address_modes).map((mode) => mode.client);

const config = {
    port: 3000,
    saltRounds: 10,
    __dirname: dirname(fileURLToPath(import.meta.url)),
    google_rechapta_secret_key: process.env.GOOGLE_RECHAPTA_SECRET,
    cookie_remember: 1000 * 60 * 60 * 24 * 30,//1 month. the user most log in at least once within a month to prevent logout
    cookie_registering: 1000 * 60 * 60 * 2,//2 hours. the email, name, ect. the user sends at the start of the registration must be finalized within 2 hour
    all_clients: all_clients,
    address_mode: address_modes.localhost,
    posts_per_request: 5,
    users_per_request: 10,
    notifications_per_request: 10,
    uploadLimitMB: 100
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const pgPool = new pg.Pool({
    user: process.env.PG_USER,
    host: config.address_mode.pg,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

async function initialize() {
    const db = pgPool;
    await db.connect();
    global.db = db;
}

global.app = app;
global.config = config;
global.ISOToSQL = (iso) => { return new Moment(iso).format() };
global.named = named;
export { transporter, pgPool, initialize };
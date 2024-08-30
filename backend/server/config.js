import env from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import { dirname } from "path";
import pg from "pg";
import { fileURLToPath } from "url";
import yesql from 'yesql';
const named = yesql.pg;
env.config();

const app = express();

//media types

const types = {
    accepted_image_types: ["image/png", "image/jpeg", "image/jpg"],
    accepted_video_types: ["video/mp4"]
};
types.accepted_media_types = [...types.accepted_image_types, ...types.accepted_video_types];

//config

const config = {
    port: 3000,
    saltRounds: 10,
    __dirname: dirname(fileURLToPath(import.meta.url)),
    google_rechapta_secret_key: process.env.GOOGLE_RECHAPTA_SECRET,
    cookie_remember: 1000 * 60 * 60 * 24 * 30,//1 month. 
    cookie_registering: 1000 * 60 * 60 * 2,//2 hours. the email, name, ect. the user sends at the start of the registration must be finalized within this time
    address_mode: {
        server: process.env.SERVER_URL,
        client: process.env.CLIENT_URL,
    },
    posts_per_request: 30,
    users_per_request: 60,
    trends_per_request: 60,
    notifications_per_request: 60,
    uploadLimitMB: 100,
    email_notification_interval: 10 * 50 * 1000,//10 minutes
    log_email_notifications: process.env.LOG_EMAIL_NOTIFICATIONS,
    extra_debug:process.env.EXTRA_DEBUG,
    fast_register:process.env.FAST_REGISTER,
    ...types
}

//nodemailer

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

//pg
const pgPool = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

async function initialize() {
    const db = pgPool;
    await db.connect();
    global.db = db;
}

//global

global.app = app;
global.config = config;
global.UserId = (req) => req.user.id;
global.named = named;

export { initialize, pgPool, transporter };

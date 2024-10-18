import bodyParser from "body-parser";
import ConnectPg from 'connect-pg-simple';
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import session from "express-session";
import passport from "passport";
import * as g from "../config.js";
import { start } from "./email_notifications.js";
import rateLimit from "express-rate-limit";
const pgSession = ConnectPg(session);

function initialize() {
    //cors
    app.use(cors({
        origin: config.address_mode.client,
        credentials: true
    }));

    //throttle limit
    // Define rate limit rules
    const limiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 5*60, // Limit each IP to 60 requests per windowMs
        message: "Too many requests from this IP, please try again later. You are banned for 5 minutes."
    });

    // Apply the rate limiting middleware to all requests
    app.use(limiter);

    //express
    app.use(express.static("public"));
    app.use(express.json());//required to get the body of the fetch post

    //session
    const https = process.env.HTTPS === "true";
    app.use(
        session({
            store: new pgSession({
                pool: g.pgPool,
                tableName: 'session'
            }),
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            proxy: process.env.PROXY === "true",
            cookie: {
                secure: https, // Set to true if using HTTPS
                sameSite: "strict",
                maxAge: false,
                httpOnly: true
            }
        })
    );

    //update session expiration 
    app.use((req, res, next) => {
        req.session.lastVisit = new Date();
        next();
    });

    //post parsers
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(
        fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            limits: {
                fileSize: config.uploadLimitMB * 1024 * 1024,
            },
            abortOnLimit: true,
            limitHandler: (req, res, next) => { res.status(400).send(`Upload limit exceeded. The limit is ${config.uploadLimitMB}MB`); }
        })
    );

    //passport
    app.use(passport.initialize());
    app.use(passport.session());

    //email notifications
    start();
}
export default initialize;
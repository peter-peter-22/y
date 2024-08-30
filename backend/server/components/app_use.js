import bodyParser from "body-parser";
import ConnectPg from 'connect-pg-simple';
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import session from "express-session";
import passport from "passport";
import * as g from "../config.js";
import { start } from "./email_notifications.js";
const pgSession = ConnectPg(session);

function initialize() {
    //express
    app.use(cors({
        origin: config.address_mode.client,
        credentials: true
    }));
    app.use(express.static("public"));
    app.use(express.json());//required to get the body of the fetch post

    //session
    app.set("trust proxy", 1); // trust first proxy
    app.use(
        session({
            store: new pgSession({
                pool: g.pgPool,
                tableName: 'session'
            }),
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: true,
            proxy: true, 
            name: '754543t8huhutrgeuh8gteruhgfh8g',
            cookie: {
                secure: process.env.HTTPS=="true", // Set to true if using HTTPS
                sameSite: "none",
                maxAge: false,
            }
        })
    );

    //update session expiration 
    app.use((req, res, next) => {
        console.log(req.session);
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
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

router.post("/update_profile_picture", async (req, res) => {
    if (pp.auth(req,res)) {
        try {
            const file = req.files.image;

            const imagesType = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!imagesType.includes(file.mimetype))
            res.status(400).send("invalid image");

            file.mv(g.config.__dirname + "/public/images/profiles/"+req.user.id+".jpg");
            res.sendStatus(200);
        }
        catch (err) {
            console.log(err);
            res.status(500).send(err.message);
        }
    }
});

router.get("/close_starting_message", async (req, res) => {
        if (pp.auth(req, res)) {
            req.session.showStartMessage = false;
            res.sendStatus(200);
        }
});

router.post("/update_username", async (req, res) => {
    if (pp.auth(req,res)) {
        try {
            const username = req.files.username;

            res.sendStatus(200);
        }
        catch (err) {
            console.log(err);
            res.status(400).send(err.message);
        }
    }
});

export default router;
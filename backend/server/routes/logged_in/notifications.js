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
import { CheckV, CheckErr, validate_image } from "../../components/validations.js";
import notifications_query,{markAsRead} from "../../components/notifications_query.js";

const router = express.Router();
router.post("/get", async (req, res) => {
	//get and validate
	const v = new Validator(req.body, {
		from: 'required|integer'
	});
	await CheckV(v);
	const { from } = req.body;
	const user_id=UserId(req);

	//get the notifications
	const notifs = await db.query(named(notifications_query)({
		user_id: user_id,
		from: from,
		limit: config.notifications_per_request
	}));

	//mark the downloaded notifications as read
	await db.query(named(markAsRead)({
		user_id: user_id,
	}));

	res.json(notifs.rows);
});

export default router;
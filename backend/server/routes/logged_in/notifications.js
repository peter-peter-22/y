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
import { postQuery, post_list, postQueryText } from "./general.js";

const users_column = `
(SELECT JSONB_AGG(JSONB_BUILD_OBJECT('id',

							USERS.ID,
							'name',
							USERS.NAME))
		FROM USERS
		WHERE USERS.ID = ANY(USER_IDS))AS USERS`;

const posts_column = `
(SELECT JSONB_BUILD_OBJECT('id',
POSTS.ID,
'text',
POSTS.TEXT)
FROM POSTS
WHERE POSTS.ID = POST_ID)AS POST`;

const repost_query = `
SELECT 2 AS TYPE,
	REPOST AS POST_ID,
	MAX(COUNT) AS USER_COUNT,
	ARRAY_AGG(PUBLISHER) AS USER_IDS,
	MAX(timestamp) AS timestamp
FROM
	(SELECT PUBLISHER,
			REPOST,
			MAX(date) OVER W AS timestamp,
			COUNT(*) OVER W,
			ROW_NUMBER(*) OVER W
		FROM POSTS
		WHERE REPOSTED_FROM_USER = :user_id WINDOW W AS (PARTITION BY POSTS.REPOST) ) AS NUMBERED_ROWS
WHERE ROW_NUMBER <= 3
GROUP BY REPOST`;

const likes_query = `
SELECT 0 AS TYPE,
	POST_ID,
	MAX(COUNT) AS USER_COUNT,
	ARRAY_AGG(USER_ID) AS USER_IDS,
	MAX(timestamp) AS timestamp
FROM
	(SELECT USER_ID,
			POST_ID,
			MAX(timestamp) OVER W AS timestamp,
			COUNT(*) OVER W,
			ROW_NUMBER(*) OVER W
		FROM LIKES
		WHERE PUBLISHER_ID = :user_id WINDOW W AS (PARTITION BY LIKES.POST_ID) ) AS NUMBERED_ROWS
WHERE ROW_NUMBER <= 3
GROUP BY POST_ID`;

const follows_query = `
SELECT *
FROM
	(SELECT 4 AS TYPE,
			NULL::int AS POST_ID,
			COUNT(*) OVER() AS USER_COUNT,
			ARRAY_AGG(FOLLOWED) AS USER_IDS,
			MAX(timestamp) AS timestamp
		FROM FOLLOWS
		WHERE FOLLOWED = :user_id
		ORDER BY timestamp DESC
		LIMIT 3) AS FOLLOWS`;

const comment_query = `
SELECT
1 AS TYPE,
id as post_id,
1 AS USER_COUNT,
date as timestamp,
null as users,
TO_JSONB(FORMATTED_POSTS.*) as post

FROM (${postQueryText}) as FORMATTED_POSTS
WHERE REPLYING_TO_PUBLISHER = :user_id`;

const columns = `
TYPE,
POST_ID,
USER_COUNT,
timestamp,
${users_column},
${posts_column}
`;

const notifications_query = `
SELECT * FROM(
    SELECT
    ${columns}
    FROM
        (
            ${repost_query}
            UNION ALL 
            ${likes_query}
            UNION ALL 
            ${follows_query}
        ) 
    AS LIKES_FOLLOWS_REPOSTS
UNION ALL ${comment_query}
    ) AS NOTIFICATIONS
ORDER BY timestamp DESC
OFFSET :from LIMIT ${config.notifications_per_request}`;

const router = express.Router();
router.post("/get", async (req, res) => {
	const v = new Validator(req.body, {
		from: 'required|integer'
	});
	await CheckV(v);
	const { from } = req.body;
	const other_notifications = await db.query(named(notifications_query)({ user_id: req.user.id, from: from }));
	res.send(other_notifications.rows);
});

export default router;
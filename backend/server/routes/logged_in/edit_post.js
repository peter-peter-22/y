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
import { GetMaxLetters } from "../user.js";
import { deletePostFiles } from "../../components/cloudinary_handler.js";
import { findHashtags, findHtml } from "../../components/sync.js";
import { notifyUser, commentPush, repostPush } from "../web_push.js";
import { postAny } from "./create_post.js";

const router = express.Router();

const filter_media = `
(
    array(
	    select * from unnest(media) as medias
	    where not ((medias ->>'public_id') = ANY (:deleted_media::text[]))
    )
)`;

router.post("/post", async (req, res) => {
    //get and validate body
    const v = new Validator(req.body, {
        id: "required|integer",
    });
    await CheckV(v);
    const { id } = req.body;

    //the hashtags still remain in their table independently from the text, they need to be deleted  on update

    async function update_post(baseCols, baseRefs, baseVals) {
        //the media deleted from the cloud
        const deleted_public_ids = get_deleted_media(req);

        //update post in db if it belongs to this user, return the old media
        const q = await db.query(named(`
        update posts 
            set text=:text,
                media=${filter_media}
        where id=:post_id
            and publisher=:user_id
        returning id,(select media from posts old where old.id=posts.id)`
        )(
            {
                post_id: id,
                deleted_media: deleted_public_ids,
                ...baseVals
            }
        ));

        //if no rows were returned, then the post either not exists or it does not belongs to this user
        if (q.rowCount === 0)
            CheckErr("this post either does not exists or does not belongs to the user");

        //get the filedata of the deleted media
        const post = q.rows[0];
        //ignore if there are no deleted files or the post has no files
        if (deleted_public_ids.length > 0 && post.media) {
            const deleted_file_data = q.rows[0].media.filter((file_data) => {
                //if this id is in the deleted ids array, add to the deleted file datas
                if (deleted_public_ids.includes(file_data.public_id))
                    return file_data;
            });

            //delete the selected files from the cloud
            await deletePostFiles(deleted_file_data, post.id);
        }
        return q;
    }

    const edited_post = await postAny(req, update_post);
    res.json(edited_post);
});

//convert deleted media into an array
function get_deleted_media(req) {
    const deleted_media = req.body.deleted_media;
    if (deleted_media === undefined)
        return [];

    if (!Array.isArray(deleted_media))
        return [deleted_media];

    return deleted_media;
}

export default router;

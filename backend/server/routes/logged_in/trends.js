import express from "express";
import nodemailer from "nodemailer";
import * as g from "../../config.js";
import * as pp from "../../components/passport.js";
import { username_exists, selectable_username } from "../user.js";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr } from "../../components/validations.js";
import postQueryText, { is_followed, is_blocked, user_columns, user_columns_extended, is_following } from "../../components/post_query.js";
import { CountableToggleSimplified, CountableToggle, postQuery, editable_query, updateViews, post_list } from "../../components/general_components.js";

const router = express.Router();

router.get("/preview", async (req, res) => {
    const q = await db.query(`
        SELECT hashtag,count FROM TRENDS
        ORDER BY count DESC
        LIMIT 10`
    );
    res.send(q.rows);
});

router.post("/list", async (req, res) => {
    const v = new Validator(req.body, {
        from: "required|integer",
    });
    await CheckV(v);

    const {from} = req.body;
    const q = await db.query(named(`
        SELECT hashtag,count FROM TRENDS
        ORDER BY count DESC
        OFFSET :from
        LIMIT :limit`
    )({
        from: from,
        limit: config.trends_per_request
    }));
    res.send(q.rows);
});


export default router;
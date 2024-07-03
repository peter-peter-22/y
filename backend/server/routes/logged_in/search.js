import express from "express";
import { post_list } from "../../components/general_components.js";
import { user_columns, is_followed } from "../../components/post_query.js";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr } from "../../components/validations.js";

const router = express.Router();

const searchUser = `
SELECT 
    ${user_columns},
    ${is_followed()} as is_followed 
FROM USERS
WHERE
    USERNAME ILIKE '%' || :text || '%'
    OR
    NAME ILIKE '%' || :text || '%'`;

const searchUserPreview = `${searchUser} LIMIT 3`;
const searchUserList = `${searchUser} OFFSET :from LIMIT :limit`;

router.post("/people_preview", async (req, res) => {
    const v = new Validator(req.body, {
        text: "required|search"
    });
    await CheckV(v);

    const { text } = req.body;
    const q = await db.query(named(searchUserPreview)({ user_id: UserId(req), text: text }));
    res.json(q.rows);
});

router.post("/people_list", async (req, res) => {
    const v = new Validator(req.body, {
        text: "required|search",
        from: "required|integer"
    });
    await CheckV(v);

    const { text, from } = req.body;
    const q = await db.query(named(searchUserList)({
        user_id: UserId(req),
        text: text,
        limit: config.users_per_request,
        from: from
    }));
    res.json(q.rows);
});

router.post("/posts", async (req, res) => {
    await post_list(req, res,
        {
            text: "required|search",
            from: "required|integer"
        },
        "WHERE HASHTAGS.HASHTAG=:text",
        {
            text: req.body.text,
            from: req.body.from
        },
        "HASHTAGS LEFT JOIN POSTS AS POST ON HASHTAGS.POST_ID=POST.ID"
    );
});

export default router;
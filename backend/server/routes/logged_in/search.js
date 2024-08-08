import express from "express";
import { Validator } from "node-input-validator";
import { post_list } from "../../components/general_components.js";
import { is_followed, user_columns } from "../../components/post_query.js";
import { CheckV } from "../../components/validations.js";

const router = express.Router();

const isOk = "ILIKE '%' || :text || '%'";

const searchUser = `
SELECT 
    ${user_columns},
    ${is_followed()} as is_followed 
FROM USERS
WHERE
    USERNAME ${isOk}
    OR
    NAME ${isOk}`;

const searchUserPreview = `${searchUser} LIMIT 3`;
const searchUserList = `${searchUser} OFFSET :from LIMIT :limit`;

const autoFillPerTopic = 5;
const searchAutofill = `
(
	select hashtag as value, 'Topics' as group from trends
	where hashtag ${isOk}
	order by trends.count desc
    limit ${autoFillPerTopic}
)
union 
(
	select username as value, 'Usernames' as group from users
	where username ${isOk}
	order by follower_count desc
    limit ${autoFillPerTopic}
)
union 
(
	select name as value, 'Names' as group from users
	where name ${isOk}
	order by follower_count desc
    limit ${autoFillPerTopic}
)`;

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
        "HASHTAGS.HASHTAG=:text",
        {
            text: req.body.text,
            from: req.body.from
        },
        "HASHTAGS LEFT JOIN POSTS AS POST ON HASHTAGS.POST_ID=POST.ID"
    );
});

router.post("/autofill", async (req, res) => {
    const v = new Validator(req.body, {
        text: "required|search",
    });
    const matched = await v.check();
    if (!matched)
        return res.json([]);

    const { text } = req.body;
    const q = await db.query(named(searchAutofill)({
        text: text,
    }));
    res.json(q.rows);
});

export default router;
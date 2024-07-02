import express from "express";
import nodemailer from "nodemailer";
import * as g from "../../config.js";
import * as pp from "../../components/passport.js";
import { username_exists, selectable_username } from "../user.js";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr } from "../../components/validations.js";
import postQueryText, { is_followed, is_blocked, user_columns, user_columns_extended,is_following } from "../../components/post_query.js";
import {CountableToggleSimplified,CountableToggle,postQuery,editable_query,updateViews,post_list} from "../../components/general_components.js";

const router = express.Router();

router.post("/follow_user", async (req, res) => {
    await CountableToggleSimplified(req, res, "follows", "follow_unique", "follower", "followed");
});

router.post("/block_user", async (req, res) => {
    await CountableToggleSimplified(req, res, "blocks", "unique_blocks", "blocker", "blocked");
});


router.post("/is_following_user", async (req, res) => {
    const v = new Validator(req.body, {
        id: 'required|integer',
    });
    await CheckV(v);
    const { id } = req.body;
    const result = await db.query(named("SELECT count(*) FROM follows WHERE follower=:me AND followed=:id")({ me: req.user.id, followed: id }));
    res.send(result.rows[0].count > 0)
});

router.post("/get_post", async (req, res) => {
    const v = new Validator(req.body, {
        id: 'required|integer',
    });
    await CheckV(v);
    const { id } = req.body;
    const posts = await postQuery(req, undefined, " WHERE post.id=:id", { id: id }, undefined, 1);
    const post = posts[0];
    if (post === undefined)
        CheckErr("this post does not exists");
    res.send(post);
});

router.post("/get_comments", async (req, res) => {
    await post_list(req, res, { id: 'required|integer' }, undefined, " WHERE replying_to=:id", { id: req.body.id });
});

router.post("/posts_of_user", async (req, res) => {
    await post_list(req, res, { user_id: "required|integer" }, undefined, " WHERE post.publisher=:target_user_id AND post.replying_to IS NULL", { target_user_id: req.body.user_id });
});

router.post("/reposts_of_post", async (req, res) => {
    await post_list(req, res, { post_id: "required|integer" }, undefined, " WHERE post.repost=:post_id AND TEXT IS NULL", { post_id: req.body.post_id });
});

router.post("/quotes_of_post", async (req, res) => {
    await post_list(req, res, { post_id: "required|integer" }, undefined, " WHERE post.repost=:post_id AND TEXT IS NOT NULL", { post_id: req.body.post_id });
});

router.post("/comments_of_user", async (req, res) => {
    await post_list(req, res, { user_id: "required|integer" }, undefined, " WHERE post.publisher=:target_user_id AND post.replying_to IS NOT NULL", { target_user_id: req.body.user_id });
});

router.post("/likes_of_user", async (req, res) => {
    await post_list(req, res, { user_id: "required|integer" }, undefined, " WHERE EXISTS(select * from likes WHERE likes.post_id=post.id AND post.publisher=:target_user_id)", { target_user_id: req.body.user_id });
});

router.post("/get_bookmarks", async (req, res) => {
    await post_list(req, res, undefined, "SELECT * FROM (", ") as subquery WHERE bookmarked_by_user=TRUE");
});

router.post("/media_of_user", async (req, res) => {
    const v = new Validator(req.body, {
        from: "required|integer",
        user_id: "required|integer"
    });
    await CheckV(v);

    const q = await db.query(named(
        `select id, image_count 
         from posts
         where image_count != 0 and publisher=:target_user_id 
         OFFSET :from LIMIT :limit`
    )({
        target_user_id: req.body.user_id,
        limit: config.posts_per_request,
        from: req.body.from
    }));
    res.send(q.rows);
});

router.post("/user_profile", async (req, res) => {
    const v = new Validator(req.body, {
        user_id: "required|integer"
    });
    await CheckV(v);

    const { user_id } = req.body;
    const q = await db.query(named(`
    select 
    ${user_columns_extended},
    banner,
    registration_date,
    birthdate,
    bio, 
    (select count(*) from follows where followed=id) as followers , 
    (select count(*) from follows where follower=id) as follows 
    from users 
    where id=:target_user_id
    `)({ target_user_id: user_id,user_id:req.user.id }));
    const user = q.rows[0];
    if (!user)
        CheckErr("this user does not exists");
    res.send(user);
});



router.post("/follower_recommendations", async (req, res) => {
    const v = new Validator(req.body, { from: "required|integer" });
    await CheckV(v);
    const { from } = req.body;
    const text = `SELECT ${user_columns} from USERS WHERE NOT ${is_followed} LIMIT :limit OFFSET :offset`;
    const users = await db.query(named(text)({
        user_id: req.user.id,
        offset: from,
        limit: config.users_per_request
    }));
    res.send(users.rows);
});

router.post("/followed_by_user", async (req, res) => {
    const v = new Validator(req.body, { 
        from: "required|integer",
        id:"required|integer"
     });
    await CheckV(v);
    const { from,id } = req.body;
    const text = `SELECT ${user_columns},TRUE as is_followed from USERS WHERE ${is_followed} LIMIT :limit OFFSET :offset`;
    const users = await db.query(named(text)({
        user_id: req.user.id,
        offset: from,
        limit: config.users_per_request,
        target_id:id
    }));
    res.send(users.rows);
});

router.post("/followers_of_user", async (req, res) => {
    const v = new Validator(req.body, { 
        from: "required|integer",
        id:"required|integer"
     });
    await CheckV(v);
    const { from,id } = req.body;
    const text = `
    SELECT 
        ${user_columns},
        ${is_followed} as is_followed 
    from USERS 
        WHERE ${is_following} 
        LIMIT :limit 
        OFFSET :offset`;
    const users = await db.query(named(text)({
        user_id: req.user.id,
        offset: from,
        limit: config.users_per_request,
        target_id:id
    }));
    res.send(users.rows);
});


router.post("/likers_of_post", async (req, res) => {
    const v = new Validator(req.body, {
         from: "required|integer",
         post_id:"required|integer"
         });
    await CheckV(v);
    const { from, post_id } = req.body;

    const user_liked_this_post = `
    EXISTS(
        SELECT * FROM LIKES
        WHERE
        USER_ID=USERS.ID
        AND
        POST_ID=:post_id
    )`;

    const text = `
    SELECT 
    ${user_columns},
    ${is_followed} AS IS_FOLLOWED,
    USERS.BIO 
    from USERS 
    WHERE ${user_liked_this_post} 
    LIMIT :limit OFFSET :offset`;

    const users = await db.query(named(text)({
        user_id: req.user.id,
        offset: from,
        limit: config.users_per_request,
        post_id: post_id
    }));

    res.send(users.rows);
});

router.post("/celebrities", async (req, res) => {
    const v = new Validator(req.body, { 
        from: "required|integer"
     });
    await CheckV(v);
    const { from } = req.body;

    const text = `
    SELECT 
    ${user_columns},
    USERS.BIO 
    from USERS 
    ORDER BY (select count(*) from follows where followed=:user_id) DESC
    LIMIT :limit OFFSET :offset`;

    const users = await db.query(named(text)({
        user_id: req.user.id,
        offset: from,
        limit: config.users_per_request
    }));

    res.send(users.rows);
});


router.post("/viewers_of_post", async (req, res) => {
    await user_list(req, res, undefined, undefined, " WHERE IS_FOLLOWED=FALSE");
});


router.get("/follower_recommendations_preview", async (req, res) => {
    const text = `SELECT ${user_columns} from USERS WHERE NOT ${is_followed} LIMIT 3`;
    const users = await db.query(named(text)({ user_id: req.user.id }));
    res.send(users.rows);
});

router.post("/repost", async (req, res) => {

    //create repost
    async function onAdd(reposted_post_id, user_id) {
        //check if this post can be reposted
        //if the reposted post does not exists, the constraint will throw an error in the next query so it can be ignored here
        const validation = await db.query(named("select exists(select * from posts where id=:post_id and repost is not null and text is null) as is_a_repost")({ post_id: reposted_post_id, user_id: user_id }));
        if (validation.rowCount !== 0) {
            const tests = validation.rows[0];
            if (tests.is_a_repost)
                throw ("a repost cannot be reposted");
        }

        //insert
        try {
            const getRepostedUser = `(SELECT publisher FROM POSTS WHERE id=:post_id)`;
            await db.query(named(`
            INSERT INTO POSTS (PUBLISHER,REPOST,REPOSTED_FROM_USER)
            SELECT :user_id,:post_id,${getRepostedUser} WHERE 
            NOT EXISTS 
            (SELECT * FROM POSTS WHERE PUBLISHER = :user_id AND REPOST = :post_id)
            AND NOT EXISTS 
            (SELECT * FROM POSTS WHERE ID = :post_id AND REPOST IS NOT NULL AND text IS NULL)`)({ user_id: user_id, post_id: reposted_post_id }));
        }
        catch (err) {
            if (err.constraint === "posts_repost_fkey")
                throw new Error("this post does not exists");
            if (err.constraint === "unique_repost") {
                //ignore
            } else
                throw (err);
        }
    }

    //delete repost
    async function onRemove(reposted_post_id, user_id) {
        await db.query(named("DELETE FROM posts WHERE publisher=:user_id AND repost=:post_id")({ user_id: user_id, post_id: reposted_post_id }));
    }

    await CountableToggle(req, res, onAdd, onRemove);
});



router.post("/like", async (req, res) => {
    async function onAdd(key, user_id) {
        const get_publisher_id = `(SELECT publisher from posts where id=:post_id)`;
        const addLike = `INSERT INTO likes (user_id,post_id,publisher_id) VALUES (:user,:post_id, ${get_publisher_id}) ON CONFLICT ON CONSTRAINT unique_likes DO NOTHING`;
        await db.query(named(addLike)({ user: user_id, post_id: key }));
    }

    async function onRemove(key, user_id) {
        await db.query(named("DELETE FROM likes WHERE user_id=:user AND post_id=:post_id")({ user: user_id, post_id: key }));
    }

    await CountableToggle(req, res, onAdd, onRemove);
});

router.post("/bookmark", async (req, res) => {
    await CountableToggleSimplified(req, res, "bookmarks", "unique_bookmarks");
});

export default router;

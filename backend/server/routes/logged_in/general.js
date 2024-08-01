import express from "express";
import nodemailer from "nodemailer";
import * as g from "../../config.js";
import * as pp from "../../components/passport.js";
import { username_exists, selectable_username } from "../user.js";
import { Validator } from "node-input-validator";
import { CheckV, CheckErr } from "../../components/validations.js";
import { is_followed, is_blocked, user_columns, user_columns_extended, is_following, bookmarked_by_user } from "../../components/post_query.js";
import { CountableToggleSimplified, CountableToggle, GetPosts, editable_query, updateViews, post_list } from "../../components/general_components.js";
import { likePush, repostPush, followPush } from "../web_push.js";

const router = express.Router();

router.post("/follow_user", async (req, res) => {
    await CountableToggleSimplified(req, res, "follows", "follow_unique", "follower", "followed");

    //send push
    const { key, value } = req.body;
    if (value) {
        followPush(req.user, key);
    }
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
    const result = await db.query(named("SELECT count(*) FROM follows WHERE follower=:me AND followed=:id")({ me: UserId(req), followed: id }));
    res.send(result.rows[0].count > 0)
});

router.post("/get_post", async (req, res) => {
    const v = new Validator(req.body, {
        id: 'required|integer',
    });
    await CheckV(v);
    const { id } = req.body;
    const posts = await GetPosts(UserId(req), "WHERE post.id=:id", { id: id }, 1);
    const post = posts[0];
    if (post === undefined)
        CheckErr("this post does not exists");
    res.send(post);
});

router.post("/get_comments", async (req, res) => {
    await post_list(req, res, { id: 'required|integer' }, "WHERE replying_to=:id", { id: req.body.id });
});

router.post("/posts_of_user", async (req, res) => {
    await post_list(req, res, { user_id: "required|integer" }, "WHERE post.publisher=:target_user_id AND post.replying_to IS NULL", { target_user_id: req.body.user_id });
});

router.post("/reposts_of_post", async (req, res) => {
    await post_list(req, res, { post_id: "required|integer" }, "WHERE post.repost=:post_id AND TEXT IS NULL", { post_id: req.body.post_id });
});

router.post("/quotes_of_post", async (req, res) => {
    await post_list(req, res, { post_id: "required|integer" }, "WHERE post.repost=:post_id AND TEXT IS NOT NULL", { post_id: req.body.post_id });
});

router.post("/comments_of_user", async (req, res) => {
    await post_list(req, res, { user_id: "required|integer" }, "WHERE post.publisher=:target_user_id AND post.replying_to IS NOT NULL", { target_user_id: req.body.user_id });
});

router.post("/likes_of_user", async (req, res) => {
    await post_list(req, res, { user_id: "required|integer" }, "WHERE EXISTS(select * from likes WHERE likes.post_id=post.id AND post.publisher=:target_user_id)", { target_user_id: req.body.user_id });
});

router.post("/get_bookmarks", async (req, res) => {
    await post_list(req, res, undefined, `WHERE ${bookmarked_by_user}=TRUE`);
});

router.post("/media_of_user", async (req, res) => {
    const v = new Validator(req.body, {
        from: "required|integer",
        user_id: "required|integer"
    });
    await CheckV(v);

    const q = await db.query(named(
        `select id, media 
         from posts
         where media is not null
         and 
         publisher=:target_user_id 
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
    `)({ target_user_id: user_id, user_id: UserId(req) }));
    const user = q.rows[0];
    if (!user)
        CheckErr("this user does not exists");
    res.send(user);
});



router.post("/follower_recommendations", async (req, res) => {
    const v = new Validator(req.body, { from: "required|integer" });
    await CheckV(v);
    const { from } = req.body;
    const text = `SELECT ${user_columns}, FALSE as is_followed from USERS WHERE NOT ${is_followed()} LIMIT :limit OFFSET :offset`;
    const users = await db.query(named(text)({
        user_id: UserId(req),
        offset: from,
        limit: config.users_per_request
    }));
    res.send(users.rows);
});

router.post("/followed_by_user", async (req, res) => {
    const v = new Validator(req.body, {
        from: "required|integer",
        id: "required|integer"
    });
    await CheckV(v);
    const { from, id } = req.body;
    const text = `SELECT ${user_columns},TRUE as is_followed from USERS WHERE ${(is_followed(":target_id"))} LIMIT :limit OFFSET :offset`;
    const users = await db.query(named(text)({
        user_id: UserId(req),
        offset: from,
        limit: config.users_per_request,
        target_id: id
    }));
    res.send(users.rows);
});

router.post("/followers_of_user", async (req, res) => {
    const v = new Validator(req.body, {
        from: "required|integer",
        id: "required|integer"
    });
    await CheckV(v);
    const { from, id } = req.body;
    const text = `
    SELECT 
        ${user_columns},
        ${is_followed()} as is_followed 
    from USERS 
        WHERE ${is_following(":target_id")} 
        LIMIT :limit 
        OFFSET :offset`;
    const users = await db.query(named(text)({
        user_id: UserId(req),
        offset: from,
        limit: config.users_per_request,
        target_id: id
    }));
    res.send(users.rows);
});


router.post("/likers_of_post", async (req, res) => {
    const v = new Validator(req.body, {
        from: "required|integer",
        post_id: "required|integer"
    });
    await CheckV(v);
    const { from, post_id } = req.body;

    const text = `
    SELECT 
    ${user_columns},
    ${is_followed()} AS IS_FOLLOWED,
    USERS.BIO
    FROM LIKES
    LEFT JOIN USERS ON LIKES.USER_ID=USERS.ID
    WHERE
    POST_ID=:post_id
    LIMIT :limit OFFSET :offset`;

    const users = await db.query(named(text)({
        user_id: UserId(req),
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
    ORDER BY follower_count DESC, USERS.ID ASC
    LIMIT :limit OFFSET :offset`;

    const users = await db.query(named(text)({
        user_id: UserId(req),
        offset: from,
        limit: config.users_per_request
    }));

    res.send(users.rows);
});

router.get("/follower_recommendations_preview", async (req, res) => {
    const text = `SELECT ${user_columns}, FALSE AS IS_FOLLOWED from USERS WHERE NOT ${is_followed()} LIMIT 3`;
    const users = await db.query(named(text)({ user_id: UserId(req) }));
    res.send(users.rows);
});

router.post("/repost", async (req, res) => {

    //create repost
    async function onAdd(reposted_post_id, user_id) {
        try {
            //insert
            const add = await db.query(named(`
            INSERT INTO POSTS (PUBLISHER,REPOST)
            VALUES (:user_id,:post_id)
            RETURNING ID`)({
                user_id: user_id, post_id: reposted_post_id
            }));

            //send push
            const repost_id = add.rows[0].id;
            repostPush(req.user, repost_id, reposted_post_id);
        }
        catch (err) {
            if (err.constraint === "posts_repost_fkey")
                throw new Error("this post does not exists");
            if (err.constraint === "unique_repost") {
                //duplicated repost attempt, ignore
            } else
                throw (err);
        }
    }

    //delete repost
    async function onRemove(reposted_post_id, user_id) {
        await db.query(named("DELETE FROM posts WHERE publisher=:user_id AND repost=:post_id AND TEXT IS NULL")({ user_id: user_id, post_id: reposted_post_id }));
    }

    await CountableToggle(req, res, onAdd, onRemove);
});

router.post("/like", async (req, res) => {
    await CountableToggleSimplified(req, res, "likes", "unique_likes");

    //send push about like
    const { key, value } = req.body;
    if (value) {
        likePush(req.user, key);
    }
});

router.post("/bookmark", async (req, res) => {
    await CountableToggleSimplified(req, res, "bookmarks", "unique_bookmarks");
});

export default router;

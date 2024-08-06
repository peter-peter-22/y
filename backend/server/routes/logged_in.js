import express from "express";
import * as pp from "../components/passport.js";
import { user_columns } from "../components/post_query.js";

import create_post from "./logged_in/create_post.js";
import delete_post from "./logged_in/delete_post.js";
import edit_post from "./logged_in/edit_post.js";
import feed from "./logged_in/feed.js";
import general from "./logged_in/general.js";
import modify from "./logged_in/modify.js";
import notifications from "./logged_in/notifications.js";
import search from "./logged_in/search.js";
import trends from "./logged_in/trends.js";

const router = express.Router();

router.use((req, res, next) => {
    if (pp.auth(req, res))
        next();
});

router.use("/modify", modify);
router.use("/create", create_post);
router.use("/delete", delete_post);
router.use("/edit", edit_post);
router.use("/general", general);
router.use("/feed", feed);
router.use("/notifications", notifications);
router.use("/trends", trends);
router.use("/search", search);

async function UpdateUser(newUser, req) {
    return new Promise(resolve => {
        req.logIn(newUser, (err) => {
            if (err)
                throw (err);
            resolve();
        });
    });
}

async function ApplySqlToUser(query_result, req) {
    const user = query_result.rows[0];
    await UpdateUser(user, req);
}

async function UpdateUserAfterChange( req) {
    const q =await db.query(named(`select ${user_columns} from users where id=:id`)({id:UserId(req)}));
    await ApplySqlToUser(q, req);
}

export default router;
export { ApplySqlToUser, UpdateUser, UpdateUserAfterChange };

import express from "express";
import { post_list } from "../../components/general_components.js";

const router = express.Router();

router.post("/get_posts", async (req, res) => {
    await post_list(req, res, undefined, "post.replying_to IS NULL");
});
router.post("/get_followed_posts", async (req, res) => {
    await post_list(req, res, undefined, "post.replying_to IS NULL AND post.publisher=ANY(SELECT follows.followed from follows WHERE follows.follower=:user_id)");
});


export default router;
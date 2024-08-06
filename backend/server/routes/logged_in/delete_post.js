import express from "express";
import { Validator } from "node-input-validator";
import { deletePostFiles } from "../../components/cloudinary_handler.js";
import { CheckErr, CheckV } from "../../components/validations.js";

const router = express.Router();

router.post("/post", async (req, res) => {
    //get and validate body
    const v = new Validator(req.body, {
        id: "required|integer"
    });
    await CheckV(v);
    const { id } = req.body;

    //delete post from db if it belongs to this user
    const q = await db.query(named(`
        delete from posts 
        where id=:post_id
        and publisher=:user_id
        returning id,media`
    )(
        {
            post_id: id,
            user_id: UserId(req)
        }
    ));


    //if no post was deleted, then the post either not exists or it does not belongs to the user
    if (q.rowCount === 0)
        CheckErr("this post either does not exists or does not belongs to the user");

    //delete the files from the cloud
    const post=q.rows[0];
    const files_to_delete = post.media;
    await deletePostFiles(files_to_delete,post.id);

    res.sendStatus(200);
});

export default router;

import express from "express";
import { Validator } from "node-input-validator";
import { CheckErr, CheckV } from "../../components/validations.js";
import { user_columns } from "../../components/post_query.js";
import { UpdateUser } from "../logged_in.js";

const router = express.Router();
router.get("/get", async (req, res) => {
    const user_id = UserId(req);

    //get user settings from db
    const q = await db.query(`select settings from users where id=$1`, [user_id]);
    if (q.rowCount === 0)
        CheckErr("this user does not exists");
    const settings = q.rows[0].settings;

    res.json(settings);
});

router.post("/set", async (req, res) => {
    //get and validate
    const v = new Validator(req.body, {
        settings: 'required|object'
    });
    await CheckV(v);
    const { settings } = req.body;
    const user_id = UserId(req);

    //update settings of user in db
    const q = await db.query(named(`
        update users
            set settings=:settings
        where
            id=:user_id
        returning ${user_columns}`)
        ({
            user_id: user_id,
            settings: settings
        })
    );

    //apply changes to session
    if (q.rowCount === 0)
        CheckErr("this user does not exists");

    const newUser = q.rows[0];
   await UpdateUser(newUser, req);

    res.sendStatus(200);
});


export default router;

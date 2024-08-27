import express from "express";
import { Validator } from "node-input-validator";
import { CheckErr, CheckV } from "../../components/validations.js";

const router = express.Router();
router.get("/get", async (req, res) => {
    const user_id = UserId(req);

    const q = await db.query(`select settings from users where id=$1`, [user_id]);
    if (q.rowCount === 0)
        CheckErr("this user does not exists");
    const settings = q.rows[0].settings;

    res.json(settings);
});

router.post("/set", async (req, res) => {
    //get and validate
    const v = new Validator(req.body, {
        timestamp: 'required|integer'
    });
    await CheckV(v);
    const { from, timestamp } = req.body;

    const user_id = UserId(req);

    //get the notifications
    const notifs = await db.query(named(notifications_query)({
        user_id,
        from,
        limit: config.notifications_per_request,
        timestamp
    }));

    //mark the downloaded notifications as read
    await db.query(named(markAsRead)({
        user_id: user_id,
    }));

    res.json(notifs.rows);
});


export default router;

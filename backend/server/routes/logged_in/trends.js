import express from "express";
import { Validator } from "node-input-validator";
import { CheckV } from "../../components/validations.js";

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
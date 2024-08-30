import express from "express";
import { Validator } from "node-input-validator";
import { CheckV } from "../components/validations.js";
import change_password from "./change_password.js";

const router = express.Router();

router.use("/change_password", change_password);

router.post('/exists/email', async (req, res) => {
    const v = new Validator(req.body, {
        email: 'required|email',
    });
        await CheckV(v);

    const { email } = req.body;
    const exists = await exists_email(email);
    res.send(exists);
});

async function exists_email(email)
{
    const result = await db.query(named("SELECT count(*) FROM users WHERE email=:email")({ email: email.toLowerCase() }));
    const exists = result.rows[0].count > 0;
    return exists;
}

router.post('/exists/username', async (req, res) => {
    const v = new Validator(req.body, {
        username: 'required|email',
    });
    await CheckV(v);

    const { username } = req.body;
    res.send(username_exists(username));
});

async function username_exists(username) {
    const result = await db.query(named("SELECT count(*) FROM users WHERE username=:username")({ username: username }));
    return result.rows[0].count > 0;
}

async function selectable_username(new_username, current_username) {
    const exists = await username_exists(new_username);
    return (!exists || new_username === current_username);
}

router.get("/get", async (req, res) => {
    console.log(`\n\nget user: \nuser: ${JSON.stringify(req.user)} \nsession: ${JSON.stringify(req.session)}\n\n` );
    res.json({
        user: req.user,
        showStartMessage: req.session.showStartMessage,
        pending_registration: req.session.pending_registration,
        maxLetters:GetMaxLetters(req.user)
    });
});

function GetMaxLetters(user)
{
    return 280;
}

export default router;
export { exists_email, GetMaxLetters, selectable_username, username_exists };

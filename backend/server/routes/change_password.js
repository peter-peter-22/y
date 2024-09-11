import express from "express";
import { Validator } from "node-input-validator";
import { hashPasswordAsync } from "../components/passport_strategies/local.js";
import { CheckErr, CheckV } from "../components/validations.js";
import * as g from "../config.js";
import { change_password, clear_user_request, create_secret, expiration_minutes } from "./change_password_queries.js";
import { CheckRechapta, SendMailAsync } from "./register.js";
const router = express.Router();

const skip = false;

router.post("/submit_chapta", async (req, res) => {
    //get inputs
    const v = new Validator(req.body, {
        email: "required|email",
        recaptchaToken: "required"
    });
    if (!skip) await CheckV(v);
    const { email, recaptchaToken } = req.body;

    //get the user that belong to this email
    const user_query = await db.query("select id,email,password_hash from users where email=$1", [email.toLowerCase()]);
    if (user_query.rowCount === 0)
        CheckErr("No Y user belongs to this email");
    const user = user_query.rows[0];
    const user_id = user.id;
    if (user.password_hash)
        CheckErr("This email was registered with Google authentication. It has no password.");

    //check rechapta solution
    if (!skip) await CheckRechapta(recaptchaToken, req);

    //generate secret code
    const code_query = await (db.query(create_secret, [user_id]));
    const secret = code_query.rows[0].secret;

    //send link with code in email
    const link = config.address_mode.client + "/change_password/" + user_id + "/" + secret;
    const mailOptions = {
        from: `Y Password change <${g.transporter.options.auth.user}>`,
        to: email,
        subject: 'Password change',
        text: `
Open the link below to change your password.
${link}
Expires in ${expiration_minutes} minutes!`
    };

    await SendMailAsync(mailOptions);
    res.sendStatus(200);
});

router.post("/change", async (req, res) => {
    //get inputs
    const v = new Validator(req.body, {
        user_id: "required|integer",
        secret: "required|integer",
        password: "required|password"
    });
    await CheckV(v);
    const { user_id, secret, password } = req.body;

    //get password hash
    const hash = await hashPasswordAsync(password);

    //change the password of the user if the secret and expiration is correct
    const change = await db.query(named(change_password)({
        user_id: user_id,
        secret: secret,
        password: hash
    }));
    if (change.rowCount === 0)
        CheckErr("This password change request is expired or invalid. Request another password change email and click the new link.");

    //delete the used change request
    await db.query(named(clear_user_request)({ user_id: user_id }));

    res.sendStatus(200);
});

export default router;

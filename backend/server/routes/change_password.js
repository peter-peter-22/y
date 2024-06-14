import express from "express";
import nodemailer from "nodemailer";
import { CheckV, CheckErr } from "../components/validations.js";
import { Validator } from "node-input-validator";
import * as g from "../config.js";
import * as pp from "../components/passport.js";
import { CheckRechapta } from "./register.js";
import { exists_email } from "./user.js";
import { SendMailAsync } from "./register.js";
import { change_password, create_secret, clear_user_request, expiration_minutes } from "./change_password_queries.js";
import { hashPasswordAsync } from "../components/passport_strategies/local.js";
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
    const user_query = await db.query("select id from users where email=$1", [email.toLowerCase()]);
    if (user_query.rowCount === 0)
        CheckErr("No Y user belongs to this email");
    const user_id = user_query.rows[0].id;

    //check rechapta solution
    if (!skip) await CheckRechapta(recaptchaToken);

    //generate secret code
    const code_query = await (db.query(create_secret, [user_id]));
    const secret = code_query.rows[0].secret;

    //send link with code in email
    const link = config.address_mode.client + "/change_password/" + user_id + "/" + secret;
    const mailOptions = {
        from: g.transporter.options.auth.user,
        to: req.body.email,
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

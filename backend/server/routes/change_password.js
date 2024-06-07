import express from "express";
import nodemailer from "nodemailer";
import { CheckV, CheckErr } from "../components/validations.js";
import { Validator } from "node-input-validator";
import * as g from "../global.js";
import * as pp from "../components/passport.js";
import { CheckRechapta } from "./register.js";
import { exists_email } from "./user.js";
import { SendMailAsync } from "./register.js";
const router = express.Router();

const create_secret = `
INSERT INTO PASSWORD_CHANGES (ID)
VALUES($1) ON CONFLICT (ID) DO
UPDATE
SET CREATED = DEFAULT,
	SECRET = DEFAULT
returning secret`;

const expireMinutes = 15;

const skip=true;

router.post("/submit_chapta", async (req, res) => {
    //get inputs
    const v = new Validator(req.body, {
        email: "required|email",
        recaptchaToken: "required"
    });
    if(!skip) await CheckV(v);
    const { email, recaptchaToken } = req.body;

    //get the user that belong to this email
    const user_query = await db.query("select id from users where email=$1", [email.toLowerCase()]);
    if (user_query.rowCount === 0)
        CheckErr("No Y user belongs to this email");
    const user_id = user_query.rows[0].id;

    //check rechapta solution
     if(!skip) await CheckRechapta(recaptchaToken);

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
Expires in ${expireMinutes} minutes!`
    };

    await SendMailAsync(mailOptions);
    res.sendStatus(200);
});

router.post("/change_password", async (req, res) => {
    const v = new Validator(req.body, {
        user_id: "required|integer",
        secret:"required|integer"
    });
    await CheckV(v);
    const { user_id, secret } = req.body;

});

export default router;

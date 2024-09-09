import axios from "axios";
import express from "express";
import { Validator } from "node-input-validator";
import * as pp from "../components/passport.js";
import { CheckErr, CheckV } from "../components/validations.js";
import * as g from "../config.js";
import { exists_email } from "./user.js";

const router = express.Router();
const skip = config.fast_register==="true";//skip rechapta and verification

router.post('/register_start', async (req, res) => {
    //get inputs
    const v = new Validator(req.body, {
        name: 'required|name',
        email: "required|email",
        checkboxes: "array",
        birthdate: "required|datepast",
        recaptchaToken: "required"
    });
   if(!skip) await CheckV(v);
    const { recaptchaToken, name, email, birthdate, checkboxes } = req.body;

    //check if email is taken
    const exists = await exists_email(email);
    if(exists)
        CheckErr("This email is already taken");

    //check rechapta solution
    if(!skip)  await CheckRechapta(recaptchaToken,req);

    //store registered data and the verification code in session
    const code = generateVerificationCode();
    req.session.registered_data = {
        name: name,
        email: email,
        birthdate: new Date(birthdate).toISOString(),
        verified: false,
        verification_code: code,
        checkboxes: checkboxes
    }
    pp.remember_session(req, config.cookie_registering);

    //send verification code in email
    const mailOptions = {
        from: `Y Verification <${g.transporter.options.auth.user}>`,
        to: req.body.email,
        subject: 'Email verification',
        text: 'Your verification code is "' + code + '"'
    };

   if(!skip) await SendMailAsync(mailOptions);

    res.sendStatus(200);
});

async function SendMailAsync(mailOptions)
{
    return new Promise(resolve => {
        g.transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                throw error;
            }
            resolve();
        });
    });
}

router.post('/verify_code', async (req, res) => {
if(!req.session.registered_data)
   return res.status(400).send("registration data missing from session");

    const { code } = req.body;
    if ( code === req.session.registered_data.verification_code && code !== undefined || skip) {
        try {
            req.session.registered_data.verified = true;
            //email verification code is ok
            res.sendStatus(200);
        }
        catch {
            res.status(400).send("the user data is missing");
        }
    }
    else {
        res.status(400).send("wrong code");
    }
});

async function CheckRechapta(recaptchaToken,req) {
    const user_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${config.google_rechapta_secret_key}&response=${recaptchaToken}&remoteip=${user_ip}`);
    const { success } = response.data;
    if (!success)
        CheckErr(`reCAPTCHA validation failed response: ${JSON.stringify(response.data)}`);
}

function generateVerificationCode() {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }

    return result;
}


export default router;
export { CheckRechapta, SendMailAsync };

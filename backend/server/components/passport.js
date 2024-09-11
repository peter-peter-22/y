import express from "express";
import { Validator } from "node-input-validator";
import passport from "passport";
import { basename } from "path";
import GithubRoutes from "./passport_strategies/github.js";
import GoogleRoutes from "./passport_strategies/google.js";
import LocalRoutes from "./passport_strategies/local.js";
import UsernameRoutes from "./passport_strategies/username.js";
import { user_columns } from "./post_query.js";
import { CheckV, CheckErr } from "./validations.js";
import { notif_types } from "../routes/web_push.js";
import requestIp from "request-ip";

const emailsEnabled = {};
["email_enabled", ...Object.values(notif_types)].forEach(el => {
    emailsEnabled[el] = true;
});


const router = express.Router();

//strategies
{
    router.use(LocalRoutes);
    router.use("/google", GoogleRoutes);
    router.use(GithubRoutes);
    router.use("/username/", UsernameRoutes);
}

router.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.log(err);
        }
        res.sendStatus(200);
    });
});

passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user);
});

function remember_session(req, time) {
    req.session.cookie.maxAge = time;
}

function auth(req, res) {
    if (req.isAuthenticated()) {
        return true;
    }
    else {
        res.sendStatus(401);
        return false;
    }
}

async function universal_auth(req, res, err, user, info, redirect) {
    try {
        if (err) { throw err; }
        if (!user) {
            if (info.registering) {
                remember_session(req, config.cookie_remember);
                req.session.pending_data = info.registering
                req.session.pending_registration = true;

                if (redirect)
                    res.redirect(config.address_mode.client);
                else
                    res.sendStatus(200);
            }
            else
                throw new Error("failed to get user");
        }
        else {
            req.logIn(user, function (err) {
                if (err) { throw err; }
                remember_session(req, config.cookie_remember);

                if (redirect)
                    res.redirect(config.address_mode.client);
                else
                    res.sendStatus(200);
            });
        }
    }
    catch (err) {
        res.status(422).send(typeof err == "string" ? err : err.message);
    }
}

router.get("/exit_registration", (req, res) => {
    req.session.pending_registration = undefined;
    res.sendStatus(200);
});

router.post("/finish_registration", async (req, res) => {
    const v = new Validator(req.body, {
        checkboxes: "array",
        birthdate: "required|datepast"
    });
    await CheckV(v);

    if (!req.session.pending_data)
        CheckErr("the pending registration data is missing from the session");

    const { birthdate, checkboxes } = req.body;
    if (checkboxes === undefined)
        checkboxes = [];

    const { name, email } = req.session.pending_data;
    await finish_registration(req, res, name, email, "", birthdate, checkboxes);
});

async function finish_registration(req, res, name, email, password_hash, birthdate, checkboxes) {
    try {
        const clientIp = requestIp.getClientIp(req);
        const uniquefied_name = await unique_username(name);
        const result = await db.query(
            named(`
            INSERT INTO users (username,name,email,password_hash,birthdate,settings,ip) 
            VALUES (:username, :name,:email,:password_hash,:birthdate,:settings,:ip) 
            RETURNING ${user_columns}`,)({
                username: uniquefied_name,
                name: name,
                email: email ? email.toLowerCase() : null,
                password_hash: password_hash,
                birthdate: birthdate,
                settings: checkboxes.includes("emails") ? emailsEnabled : null,
                ip: clientIp
            })
        );

        const user = result.rows[0];
        req.logIn(user, function (err) {
            if (err) { throw err; }
            remember_session(req, config.cookie_remember);
            req.session.showStartMessage = true;
            res.sendStatus(200);
        });
    }
    catch (e) {
        if (e.constraint === "users_email_key")
            CheckErr("this email is already registered");
        else if (e.constraint === "users_username_key")
            CheckErr("this username is already registered");
        else {
            throw e;
        }
    }
}

async function unique_username(baseName) {//ha rövid nevet ír be akkor sok avoid lesz és ez hibát okozhat
    const result = await db.query(named("SELECT username FROM users WHERE username LIKE :baseName || '%'")({ baseName: baseName }));
    if (result.rowCount === 0)
        return baseName;
    const avoid = result.rows.map(row => row.username);
    const maxUsernameNameLength = 50;
    const maxNumberLength = maxUsernameNameLength - basename.length;
    const maxNumber = Math.min(Math.pow(10, maxNumberLength) - 1, Number.MAX_SAFE_INTEGER);
    //try add a number to the base name until reaching an unique name
    for (let n = 0; n <= maxNumber; n++) {
        const attempt = baseName + n;
        if (!avoid.includes(attempt))
            return attempt;
    }
    //if the base name is too long and all numbered versions are taken, return only a number
    for (let n = 0; n <= Number.MAX_SAFE_INTEGER; n++) {
        if (!avoid.includes(n))
            return n;
    }
    //unique name cannot be created, returning base name
    return basename;
}

export { auth, finish_registration, remember_session, router, universal_auth };


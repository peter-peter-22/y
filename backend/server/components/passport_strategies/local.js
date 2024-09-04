import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import { Validator } from "node-input-validator";
import { universal_auth, finish_registration } from "../passport.js";
import { CheckV } from "../validations.js";
import { user_columns } from "../post_query.js";

const router = express.Router();

//routes
router.post(
    "/login",
    (req, res, next) => {
        passport.authenticate('local', function (err, user, info) {
            universal_auth(req, res, err, user, info, true);
        })(req, res, next);
    }
);

//use
passport.use(
    "local",
    new Strategy(
        {
            usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
            passwordField: 'password'
        },
        async function verify(email, password, cb) {
            try {
                const result = await db.query(`SELECT ${user_columns},password_hash FROM users WHERE email = $1 and password_hash!=''`, [
                    email.toLowerCase()
                ]);
                if (result.rows.length > 0) {
                    const user = result.rows[0];
                    if (user.password_hash === null)
                        return cb(new Error("This email belongs to a third party login"));
                    const storedHashedPassword = user.password_hash;

                    try {
                        await comparePasswordAsync(password, storedHashedPassword);
                        return cb(null,user)
                    }
                    catch (err) {
                        return cb(err, null);
                    }

                } else {
                    //user not found
                    return cb("Wrong email", false);
                }
            } catch (err) {
                console.error(err);
            }
        })
);

router.post("/submit_password", async (req, res) => {
    const v = new Validator(req.body, {
        password: 'required|password',
    });
    await CheckV(v);

    if (req.session.registered_data === undefined)
        return (res.status(400).send("no registered data"));

    const data = req.session.registered_data;
    if (data.verified === false)
        return (res.status(400).send("this email is not verified"));

    const { password } = req.body;
    const hash = await hashPasswordAsync(password);
    await finish_registration(req, res, data.name, data.email, hash, data.birthdate, data.checkboxes);
});

function hashPasswordAsync(password) {
    return new Promise(resolve => {
        bcrypt.hash(password, config.saltRounds, async (err, hash) => {
            if (err) {
                throw (err);
            } else {
                await resolve(hash);
            }
        });
    });
}

function comparePasswordAsync(password, compareWith) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, compareWith, (err, valid) => {
            if (err) {
                //Error with password check
                throw (err);
            } else {
                if (valid) {
                    //Passed password check
                    resolve();
                } else {
                    //Did not pass password check
                    reject("Wrong password");
                }
            }
        });
    });
}

export default router;
export { hashPasswordAsync ,comparePasswordAsync};


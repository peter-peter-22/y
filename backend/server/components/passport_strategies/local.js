import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import yesql from 'yesql';
import { Validator } from "node-input-validator";
import { universal_auth, finish_registration } from "../passport.js";
import { CheckV } from "../validations.js";
import { user_columns } from "../post_query.js";
const named = yesql.pg;

const router = express.Router();

//routes
{
    router.post(
        "/login",
        (req, res, next) => {
            passport.authenticate('local', function (err, user, info, status) {
                universal_auth(req, res, err, user, info, true);
            })(req, res, next);
        }
    );
}

//use
{
    passport.use(
        "local",
        new Strategy(
            {
                usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
                passwordField: 'password'
            },
            async function verify(email, password, cb) {
                try {
                    const result = await db.query(`SELECT ${user_columns},password_hash FROM users WHERE email = $1 `, [
                        email.toLowerCase()
                    ]);
                    if (result.rows.length > 0) {
                        const user = result.rows[0];
                        if(user.password_hash===null)
                        return cb(new Error("This email belongs to a third party login"));
                        const storedHashedPassword = user.password_hash;
                        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                            if (err) {
                                //Error with password check
                                console.error("Error comparing passwords:", err);
                                return cb(err);
                            } else {
                                if (valid) {
                                    //Passed password check
                                    return cb(null, user);
                                } else {
                                    //Did not pass password check
                                    return cb("Wrong password", false);
                                }
                            }
                        });
                    } else {
                        //user not found
                        return cb("Wrong email", false);
                    }
                } catch (err) {
                    console.error(err);
                }
            })
    );
}

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

    try {
        const { password } = req.body;
        const hash = await hashPasswordAsync(password);
        await finish_registration(req, res, data.name, data.email, hash, data.birthdate, data.checkboxes);
    } catch (err) {
        console.log(err);
    }
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

export default router;
export { hashPasswordAsync };


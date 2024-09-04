import express from "express";
import { Validator } from "node-input-validator";
import { finish_registration, universal_auth } from "../passport.js";
import { user_columns } from "../post_query.js";
import { CheckErr, CheckV } from "../validations.js";
import { hashPasswordAsync ,comparePasswordAsync} from "./local.js";
const router = express.Router();

//routes
router.post("/login", async (req, res, next) => {
    const v = new Validator(req.body, {
        username: 'required|username',
        password: 'required|password',
    });
    await CheckV(v);
    const { username, password } = req.body;

    await verify(username, password, function (err, user, info) {
        universal_auth(req, res, err, user, info, true);
    });
}
);

router.post("/register", async (req, res) => {
    const v = new Validator(req.body, {
        name: 'required|name',
        password: 'required|password',
    });
    await CheckV(v);
    const { name, password } = req.body;

    await Authenticate(name, password, async (err, user, info) => {
        if (err) CheckErr(err);
        const hash = await hashPasswordAsync(password);
        await finish_registration(req, res, name, null, hash, new Date().toISOString(), []);
    });
});

async function verify(username, password, cb) {
    try {
        const result = await db.query(`SELECT ${user_columns},password_hash FROM users WHERE username = $1 and password_hash!=''`, [
            username
        ]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (user.password_hash === null) {
                cb(new Error("This email belongs to a third party login"));
                return;
            }
            const storedHashedPassword = user.password_hash;
            try {
                await comparePasswordAsync(password, storedHashedPassword);
                cb(null, user);
            }
            catch (err) {
                cb(err, user);
            }
        } else {
            //user not found
            cb("Wrong username", false);
        }
    } catch (err) {
        console.error(err);
    }
}

async function Authenticate(name, password, cb) {
    try {
        cb(null, null, {
            registering: {
                name,
                password
            }
        });
    }
    catch (err) {
        cb(err);
    }
}

export default router;
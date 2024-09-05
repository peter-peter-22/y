import express from "express";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import { universal_auth } from "../passport.js";
import { user_columns } from "../post_query.js";

const router = express.Router();

//the sign in/up with google button was pressed
router.get("/auth",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

//redirect after login
router.get("/redirect", (req, res, next) => {
    passport.authenticate('google', async (err, user, info) => {
        await universal_auth(req, res, err, user, info, true);
    })(req, res, next)
});

//strategy
passport.use(
    "google",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK,
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const query_result = await db.query(`SELECT ${user_columns} FROM users WHERE email=$1`, [profile.email]);
                if (query_result.rowCount === 0) {
                    cb(null, null, {
                        registering: {
                            name: profile.given_name,
                            email: profile.email,
                        }
                    });
                }
                else {
                    cb(null, query_result.rows[0]);
                }
            }
            catch (err) {
                cb(err);
            }
        }
    )
);

export default router;

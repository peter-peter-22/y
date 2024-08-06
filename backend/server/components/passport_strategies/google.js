import express from "express";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import { universal_auth } from "../passport.js";
import { user_columns } from "../post_query.js";

const router = express.Router();
const google_login_redirect=  process.env.GOOGLE_CALLBACK;

//routes
{
    //the sign in/up with google button was pressed
    router.get("/auth/google",
        passport.authenticate("google", {
            scope: ["profile", "email", ]
        })
    );

    //redirect after login
    router.get(google_login_redirect, function (req, res, next) {
        passport.authenticate('google', function (err, user, info, status) {
            universal_auth(req,res,err,user,info);
        })(req, res, next);
    });
}

//uses
{
    passport.use(
        "google",
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: config.address_mode.server + google_login_redirect,
            },
            async (accessToken, refreshToken, profile, cb) => {
                try {
                    const query_result = await db.query(`SELECT ${user_columns} FROM users WHERE email=$1`, [profile.email])
                    if (query_result.rowCount === 0) {
                      cb(null, null, {
                        registering: {
                            name: profile.displayName,
                            email: profile.email,
                        }
                    });
                    }
                    else {
                        cb(null, query_result.rows[0]);
                    }
                }
                catch (err) {
                    console.log(err);
                    cb(err);
                }
            }
        )
    );
}

export default router ;


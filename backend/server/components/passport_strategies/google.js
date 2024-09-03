import axios from "axios";
import express from "express";
import passport from "passport";
import { universal_auth } from "../passport.js";
import { user_columns } from "../post_query.js";
import { CheckErr } from "../validations.js";

const router = express.Router();

//routes
{
    //the sign in/up with google button was pressed
    router.get("/auth/google",
        passport.authenticate("google", {
            scope: ["profile", "email",]
        })
    );

    //get the url that leads to google auth site
    router.get("/auth/google/url", (req, res) => {
        const clientId = process.env.GOOGLE_CLIENT_ID; // Replace with your Google client ID
        const redirectUri = process.env.GOOGLE_CALLBACK; // Replace with your correct redirect URI
        const scope = 'profile email';
        const responseType = 'code';

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
        res.json(authUrl);
    });

    //login or register based on the code the user got from google
    router.post("/auth/google/process_code", async (req, res) => {
        const { code } = req.body;
        try {
            // Exchange the authorization code for tokens
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_CALLBACK, // Use 'postmessage' if handling code directly from the client
                grant_type: 'authorization_code'
            });

            const { access_token, id_token } = tokenResponse.data;

            // Retrieve user profile using the access token
            const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
                headers: { Authorization: `Bearer ${access_token}` }
            });

            const userProfile = profileResponse.data;

            //authenticate the user with the obtained profile then redirect
            Authenticate(access_token, id_token, userProfile, async (err, user, info) => {
                await universal_auth(req, res, err, user, info);
            });
        } catch (error) {
            //format error before sending
            CheckErr(`Error exchanging code. ${JSON.stringify(error.response?.data)}`);
        }
    });
}

//process the authenticated data
async function Authenticate(accessToken, refreshToken, profile, cb) {
    try {
        const query_result = await db.query(`SELECT ${user_columns} FROM users WHERE email=$1`, [profile.email])
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

export default router;


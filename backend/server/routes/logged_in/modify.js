import express from "express";
import Moment from "moment";
import { Validator } from "node-input-validator";
import { bannerId, profileFolder, profileId, uploadMedia } from "../../components/cloudinary_handler.js";
import * as pp from "../../components/passport.js";
import { user_columns } from "../../components/post_query.js";
import { CheckErr, CheckV, validate_image } from "../../components/validations.js";
import { ApplySqlToUser, UpdateUserAfterChange } from "../logged_in.js";
import { selectable_username } from "../user.js";

const bools = (array,value) => array.reduce((m, v) => (m[v] = value, m), {});
const push_settings = ["push_enabled", "push_comments", "push_reposts", "push_likes", "push_follows"];
const push_enabled = bools(push_settings,true);
const push_disabled = bools(push_settings,false);

const router = express.Router();

router.post("/update_profile_picture", async (req, res) => {
    const file = req.files.image;
    await update_profile_picture(req, file);
    res.sendStatus(200);
});

async function update_profile_picture(req, file) {
    await update_profile_file(req, file, profileId, "picture");
}
async function update_profile_banner(req, file) {
    await update_profile_file(req, file, bannerId, "banner");
}

async function update_profile_file(req, file, fileName, update_column) {
    validate_image(file);
    const user_id = UserId(req);
    const fileData = await uploadMedia(file, fileName, profileFolder(user_id));
    const q = await db.query(named(`
        UPDATE users 
        SET ${update_column} = :file 
        WHERE id=:user_id 
        returning ${user_columns}`
    )
        ({
            user_id: user_id,
            file: fileData
        }));
    await ApplySqlToUser(q, req);
}


router.get("/close_starting_message", async (req, res) => {
    req.session.showStartMessage = false;
    res.sendStatus(200);
});

router.post("/change_username", async (req, res) => {
    const v = new Validator(req.body, {
        username: 'required|username',
    });
    await CheckV(v);

    const { username } = req.body;
    await update_username(req, username);

    res.sendStatus(200);
});

async function update_username(req, username, skip_update = false) {
    const selectable = await selectable_username(username, req.user.username);
    if (!selectable)
        CheckErr("this username is not available");

    const result = await db.query(named(`
        UPDATE users 
        SET username=:username 
        WHERE id=:id 
        RETURNING ${user_columns}`
    )
        ({ username: username, id: UserId(req) }));
    if (!skip_update)
        await ApplySqlToUser(result, req);
}

router.post('/ok_username', async (req, res) => {
    if (pp.auth(req, res)) {

        const v = new Validator(req.body, {
            username: 'required|username',
        });
        const matched = await v.check();
        if (!matched)
            return res.send(false);;

        const { username } = req.body;
        const selectable = await selectable_username(username, req.user.username);
        res.send(selectable);
    }
});

router.post("/change_browser_notifications", async (req, res) => {
    const v = new Validator(req.body, {
        enabled: 'required|boolean',
    });
    await CheckV(v);
    const {enabled}=req.body;

    const result = await db.query(named(`
        UPDATE users 
        SET settings=coalesce(settings,'{}'::jsonb) || :set::jsonb
        WHERE id=:id 
        RETURNING ${user_columns}`
    )({
        set: enabled?push_enabled: push_disabled,
        id: UserId(req)
    }));
    await ApplySqlToUser(result, req);
    res.sendStatus(200);
});

router.post("/update_profile", async (req, res) => {
    //valdiate user data
    const v = new Validator(req.body, {
        username: 'username',
        birthdate: "datepast",
        name: "name",
        bio: "string"
    });
    await CheckV(v);

    //update user data
    const user_id = UserId(req);
    const { username, birthdate, name, bio } = req.body;
    if (username !== undefined)
        await update_username(req, username, true);
    if (birthdate !== undefined)
        await db.query(named("UPDATE users SET birthdate=:birthdate where id=:user_id")({ user_id: user_id, birthdate: ISOToSQL(birthdate) }));
    if (name !== undefined)
        await db.query(named("UPDATE users SET name=:name WHERE id=:user_id")({ name: name, user_id: user_id }));
    if (bio !== undefined)
        await db.query(named("UPDATE users SET bio=:bio WHERE id=:user_id")({ bio: bio, user_id: user_id }));

    if (req.files) {
        //update pics
        const { profile_pic, banner_pic } = req.files;
        if (profile_pic !== undefined)
            await update_profile_picture(req, profile_pic);
        if (banner_pic !== undefined)
            await update_profile_banner(req, banner_pic);
    }

    //apply changes to logged in user
    await UpdateUserAfterChange(req);

    res.sendStatus(200);
});

function ISOToSQL(iso) { return new Moment(iso).format() }

export default router;
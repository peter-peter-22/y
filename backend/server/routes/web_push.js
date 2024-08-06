import express from "express";
import webpush from "web-push";

const router = express.Router();

webpush.setVapidDetails(
    "mailto:gfdifgjiugfdjiudfgjjiu@gmail.com",
    process.env.WEB_PUSH_PUBLIC,
    process.env.WEB_PUSH_PRIVATE
);

const icon = config.address_mode.client + "/images/logo.png";

//the client enabled notifications, store the subscription and send a test notification
router.post("/subscribe", async (req, res) => {
    //get subscription
    const subscription = req.body.subscription;

    //store subscription
    await db.query(named("update users set push_subscribtion=:sub where id=:user_id")({
        user_id: UserId(req),
        sub: subscription
    }));

    //send test notification
    const payload = createPayload("Notifications enabled");
    await sendNotification(subscription, payload);

    //end
    res.sendStatus(201);
});

async function sendNotification(subscription, payload) {
    await webpush.sendNotification(subscription, JSON.stringify(payload)).catch((err) => {
        console.log("WEBPUSH SENDING ERROR");
        console.error(err);
    });
}

async function notifyUser(user_id, payload) {
    //getting subscription
    const get_sub = await db.query("select push_subscribtion from users where id=$1", [user_id]);
    if (get_sub.rowCount === 0)
        return console.error("attempted to send notification to a user id that does not exists");
    const subscription = get_sub.rows[0].push_subscribtion;

    //if notifications are not enabled for this user, exit
    if (subscription === null)
        return;

    //send notification to sub
    await sendNotification(subscription, payload);
}

function createPayload(title, body, url, tag) {
    return {
        title: title,
        options: {
            body: body,
            tag: tag,
            badge: icon,
            data: {
                url: url
            }
        }
    };
}


async function getPublisher(post_id) {
    const user_q = await db.query("select publisher from posts where id=$1", [post_id]);
    return user_q.rows[0].publisher;
}

async function likePush(user, post_id) {
    try {
        //get the id of the notified user
        const notified_user_id = await getPublisher(post_id);

        //components
        const title = `${formatName(user.name)} liked your post`;
        const url = config.address_mode.client + "/posts/" + post_id;
        const tag = "like" + post_id;

        //create payload
        const payload = createPayload(
            title,
            undefined,
            url,
            tag
        );

        //send
        await notifyUser(notified_user_id, payload);
    }
    catch (err) {
        console.log("LIKE PUSH ERROR");
        console.error(err);
    }
}

async function commentPush(user, comment_id, replying_to) {
    try {
        //get the id of the notified user
        const notified_user_id = await getPublisher(replying_to);

        //components
        const title = `${formatName(user.name)} replied to you`;
        const url = config.address_mode.client + "/posts/" + comment_id;
        const tag = "reply" + replying_to;

        //create payload
        const payload = createPayload(
            title,
            undefined,
            url,
            tag
        );

        //send
        await notifyUser(notified_user_id, payload);
    }
    catch (err) {
        console.log("COMMENT PUSH ERROR");
        console.error(err);
    }
}

async function repostPush(user, repost_id, reposted_id) {
    try {
        //get the id of the notified user
        const notified_user_id = await getPublisher(reposted_id);

        //components
        const title = `${formatName(user.name)} reposted your post`;
        const url = config.address_mode.client + "/posts/" + repost_id;
        const tag = "repost" + reposted_id;

        //create payload
        const payload = createPayload(
            title,
            undefined,
            url,
            tag
        );

        //send
        await notifyUser(notified_user_id, payload);
    }
    catch (err) {
        console.log("REPOST PUSH ERROR");
        console.error(err);
    }
}

async function followPush(user, followed) {
    try {
        //components
        const title = `${formatName(user.name)} followed you`;
        const url = config.address_mode.client + "/profile/" + user.id;
        const tag = "follow";

        //create payload
        const payload = createPayload(
            title,
            undefined,
            url,
            tag
        );

        //send
        await notifyUser(followed, payload);
    }
    catch (err) {
        console.log("FOLLOW PUSH ERROR");
        console.error(err);
    }
}

function formatName(name) {
    const maxLength = 20;
    if (name.length <= 20)
        return `"${name}"`;
    else
        return `"${name.substring(0, maxLength)}..."`;
}

export default router;
export { commentPush, followPush, likePush, notifyUser, repostPush };

import express from "express";
import webpush from "web-push";
import env from "dotenv";

const router = express.Router();

webpush.setVapidDetails(
    "mailto:gfdifgjiugfdjiudfgjjiu@gmail.com",
    process.env.WEB_PUSH_PUBLIC,
    process.env.WEB_PUSH_PRIVATE
);

router.post("/subscribe", (req, res) => {
    const subscription = req.body.subscription;

    res.status(201).json({ status: "success" });

    const notificationPayload = {
        title: "New Notification",
        body: "This is a new notification",
        icon: "",
        data: {
            url: config.address_mode.client,
        },
    };

    webpush.sendNotification(subscription, JSON.stringify(notificationPayload));
});

router.post("/send-notification", (req, res) => {
    const notificationPayload = {
        title: "New Notification",
        body: "This is a new notification",
        icon: "",
        data: {
            url: config.address_mode.client,
        },
    };

    Promise.all(
        subscriptions.map((subscription) =>
            webpush.sendNotification(subscription, JSON.stringify(notificationPayload))
        )
    )
        .then(() => res.status(200).json({ message: "Notification sent successfully." }))
        .catch((err) => {
            console.error("Error sending notification");
            res.sendStatus(500);
        });
});

export default router;

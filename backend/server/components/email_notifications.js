import { transporter } from "../config.js";
import { SendMailAsync } from "../routes/register.js";
import { email_notifications } from "./notifications_query.js";

//send emails to the users who have new unread notifications
async function sendEmailNotifications() {
    try {
        if(config.log_email_notifications) console.log("sending email notifications...");

        //get the users who need email notifications and their necessary data
        //the query also updates the users and excludes them from the next emails as long as the don't get new unread notifications
        const q = await db.query(email_notifications);

        //send emails simultaneously
        for await (const row of q.rows) {
            await sendEmailNotification(row.email, row.name, row.unread_notification_count);
        }

        if(config.log_email_notifications)  console.log("email notifications sent successfully");
    }
    catch (e) {
        console.error(e);
    }
}

async function sendEmailNotification(email, name, count) {
    const text = `
${name} you have ${count} unread notifications. 
See them here:
${config.address_mode.client}/notifications

Do you want to turn of email notifications?
Adjust your notification settings here:
${config.address_mode.client}/settings`;

    const mailOptions = {
        from: transporter.options.auth.user,
        to: email,
        subject: 'Email notifications',
        text: text
    };

    await SendMailAsync(mailOptions);
}

//send mails continuusly
function start() {
    setInterval(sendEmailNotifications, config.email_notification_interval);
}

export { start };

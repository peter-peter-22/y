import { transporter } from "../config.js";
import { SendMailAsync } from "../routes/register.js";

const local = process.env.DEMO_EMAIL_NOTIFICATIONS === "true";
const interval = local ? 1 * 60 * 1000 : 10 * 60 * 1000;//1 or 10 minutes
const log = process.env.LOG_EMAIL_NOTIFICATIONS === "true";

const email_notifications = `
update users
	set last_email_notifications=unread_notification_count
where 
    (settings->'email_enabled')::boolean=true and unread_notification_count > 0 and email is not null
	and last_email_notifications!=unread_notification_count
returning
	name,unread_notification_count,email`;


//send emails to the users who have new unread notifications
async function sendEmailNotifications() {
    try {
        if (log) console.log("sending email notifications...");

        //get the users who need email notifications and their necessary data
        //the query also updates the users and excludes them from the next emails as long as the don't get new unread notifications
        const q = await db.query(email_notifications);

        //send emails simultaneously
        for await (const row of q.rows) {
            await sendEmailNotification(row.email, row.name, row.unread_notification_count);
        }

        if (log) console.log(`${q.rowCount} email notifications sent successfully`);
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
        from: `Y Community <${transporter.options.auth.user}>`,
        to: email,
        subject: 'Email notifications',
        text: text
    };

    if (local)
        console.log(text);
    else
        await SendMailAsync(mailOptions);
}

//send mails continuusly
function start() {
    setInterval(sendEmailNotifications, interval);
}

export { start };

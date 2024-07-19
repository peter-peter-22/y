import { transporter } from "../config.js";
import { SendMailAsync } from "../routes/register.js";

let needsEmail = [];

//add the user to the email notification listeners
function prepareEmailNotification(user_id) {
    if (!needsEmail.includes(user_id))
        needsEmail.push(user_id);
}

//send email notification to the listeners then clear the list
async function sendEmailNotifications() {
    needsEmail.forEach((user_id) => {
        console.log(user_id);
    });
    needsEmail = [];
}

//send mails continuusly
setInterval(sendEmailNotifications,5000);

export { prepareEmailNotification };
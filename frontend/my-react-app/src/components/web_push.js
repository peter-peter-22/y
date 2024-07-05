import axios from "axios";
import { Endpoint } from "/src/communication.js";

const publicVapidKey = "BJAV4oJB0p26ezj0U7-GeTMgMIvCMpvqKflKjUzgSCPQuJ9Wklh36Sfbs5uWHbBaoK06GkVR9Ni1PtIjAiJrxiQ";

//check for service worker
if ("serviceWorker" in navigator) {
    send().catch(err => console.error(err));
}

//register SW, register push, send push
async function send() {
    //register service worker
    console.log("registering service worker");
    const register = await navigator.serviceWorker.register("/worker.js", {
        scope: "/"
    });
    console.log("service worker registered");

    //register push
    console.log("registering push");
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey
    });
    console.log(subscription);
    console.log("push registered");

    //send push notification
    console.log("sending push");
    await axios.post(Endpoint("/subscribe"),
        { subscription: subscription }
    );
    console.log("push sent");
}
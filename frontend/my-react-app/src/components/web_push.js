import axios from "axios";
import { Error } from "/src/components/modals";

const publicVapidKey = "BJAV4oJB0p26ezj0U7-GeTMgMIvCMpvqKflKjUzgSCPQuJ9Wklh36Sfbs5uWHbBaoK06GkVR9Ni1PtIjAiJrxiQ";

//check for service worker
async function Ask() {
    if ("serviceWorker" in navigator) {
        await send().catch(err => {
            Error(err);
            throw (err);
        });
    }
}

//register SW, register push, send push
async function send() {
    //register service worker
    console.log("registering service worker");
    const register = await navigator.serviceWorker.register("/worker.js", {
        scope: "/"
    });
    console.log("service worker registered");

    setTimeout(async () => {

        //register push
        console.log("registering push");
        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicVapidKey
        });
        console.log("push registered");

        //send push notification
        console.log("sending subscription to server");
        await axios.post("subscribe",
            { subscription: subscription }
        );
        console.log("subscription sent");

    }, (200));


}

export default Ask;
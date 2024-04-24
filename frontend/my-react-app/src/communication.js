import axios from "axios";
import { Error } from "/src/components/modals";

axios.defaults.withCredentials = true

axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    Error(error);
    return Promise.reject(error);
});

const url = "http://localhost:3000";

function Endpoint(endpoint) {
    return (url + endpoint);
}

function FormatAxiosError(error) {
    let text;
    try {
        text = error.response.data;
    } catch {
        text = error.message;
    }
    return text;
}

export { Endpoint, FormatAxiosError }
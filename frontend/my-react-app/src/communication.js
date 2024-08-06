import axios from "axios";
import config from "/src/components/config.js";
import { Error } from "/src/components/modals";

axios.defaults.withCredentials = true
axios.defaults.baseURL = config.address_mode.server;

axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    Error(error);
    return Promise.reject(error);
});

function FormatAxiosError(error) {
    let text;
    const res = error.response;
    if (res && typeof res.data == "string")
        text = res.data
    else
        text = error.message;
    return text;
}

function IsAxiosError(err) {
    return err.name === "AxiosError";
}

function ThrowIfNotAxios(err) {
    if (!IsAxiosError(err))
        throw (err);
}

export { FormatAxiosError, IsAxiosError, ThrowIfNotAxios };

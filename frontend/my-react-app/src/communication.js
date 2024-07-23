import axios from "axios";
import { Error } from "/src/components/modals";
import config from "/src/components/config.js";

axios.defaults.withCredentials = true

axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    Error(error);
    return Promise.reject(error);
});

const url = config.address_mode.server;

function Endpoint(endpoint) {
    return (url + endpoint);
}

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

export { Endpoint, FormatAxiosError, ThrowIfNotAxios, IsAxiosError }
import Axios from "axios";

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

export { Endpoint,FormatAxiosError }
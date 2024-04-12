import Axios from "axios";

const url = "http://localhost:3000";

function Endpoint(endpoint)
{
    return(url+endpoint);
}

export {Endpoint}
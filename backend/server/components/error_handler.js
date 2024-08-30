import "../config.js";
//error caused by db constraints and errors with status are not logged unless extra debug is enabled
const extra_debug = config.extra_debug;//log all errors

//webpush and email notification related functions are not handled here

function error_handler(err, req, res, next) {
    //if db constraint, or error with status
    if (err.constraint || err.status) {
        //if this is a constraint error, than the status is not set yet
        if(err.constraint)
            err.status=422;

        res.status(err.status).send(err.message);

        if (extra_debug) {
            console.log("EXTRA DEBUG error:");
            console.error(err)
        }
    }
    else {
        //unintended error
        console.log("CAUGHT internal server error:");
        console.error(err)
        res.status(500).send("Internal server error: '" + err.message + "'");
    }
}

export { error_handler };

import "express-async-errors";
import { error_handler } from "./components/error_handler.js";

//initialize and set global variables
import "./components/validations.js";
import * as c from "./config.js";
await c.initialize();

//add middlewares
import initialize_app from "./components/app_use.js";
initialize_app();

//add routes to app
import register from "./routes/register.js";
app.use('/', register);

import user from "./routes/user.js";
app.use("/user", user);

import member from "./routes/logged_in.js";
app.use("/member", member);

import { router as passport_routes } from "./components/passport.js";
app.use("/", passport_routes);

import webpush from "./routes/web_push.js";
app.use("/", webpush);

app.get("/", (req, res) => {
    res.send("this is the server");
});

//handle all (currently) uncaught errors
app.use(error_handler);

const port = config.port;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
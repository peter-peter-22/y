import React from "react";

import { Route, Routes } from "react-router-dom";
import ChangePassword from "/src/pages/change_password";
import NotImplemented from "/src/pages/not_implemented";
import PP from "/src/pages/pp";
import GoogleLogin from "/src/components/login_redirects/google";

export default (props) => {
    return (
        <Routes>
            <Route path="/change_password/:user_id/:secret" element={<ChangePassword />} />
            <Route path="/privacy_policy" element={<PP />} />
            <Route path="/login/google" element={<GoogleLogin/>}/>
            <Route path="*" element={props.children} />
        </Routes>
    );
};
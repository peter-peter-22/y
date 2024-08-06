import React from "react";

import { Route, Routes } from "react-router-dom";
import ChangePassword from "/src/pages/change_password";
import NotImplemented from "/src/pages/not_implemented";
import PP from "/src/pages/pp";

export default (props) => {
    return (
        <Routes>
            <Route path="/change_password/:user_id/:secret" element={<ChangePassword />} />
            <Route path="/tos" element={<NotImplemented />} />
            <Route path="/privacy_policy" element={<PP />} />
            <Route path="/cookie_policy" element={<NotImplemented />} />
            <Route path="/accessibility" element={<NotImplemented />} />
            <Route path="/ads_info" element={<NotImplemented />} />
            <Route path="/business" element={<NotImplemented />} />
            <Route path="/blog" element={<NotImplemented />} />
            <Route path="*" element={props.children} />
        </Routes>
    );
};
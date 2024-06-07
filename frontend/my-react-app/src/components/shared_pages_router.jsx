import React from "react";
import { AboveBreakpoint } from '/src/components/utilities';
import Axios from "axios";
import { Endpoint } from "/src/communication.js";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ChangePassword from "/src/pages/change_password";

export default (props) => {
    return (
        <Routes>
           <Route path="/change_password/:user_id/:secret" element={<ChangePassword />} />
            <Route path="*" element={props.children} />
        </Routes>
    );
};
import React from "react";
import { AboveBreakpoint } from '/src/components/utilities';
import Axios from "axios";
import { Endpoint } from "/src/communication.js";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "/src/components/header";
import Footer from "/src/components/footer";

//pages
import Home from "/src/pages/home";
import Test from "/src/pages/test";
import Notifications from "/src/pages/notifications";
import Error from "/src/pages/error";

export default () => {
  const isBig = AboveBreakpoint("sm");
  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "column", alignItems: isBig ? "center" : "stretch", overflowY: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "row", padding: isBig ? "revert-layer" : 0 }}>
          <Header />
          <div style={isBig ? { width: "500px" } : { flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/test" element={<Test />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="*" element={<Error />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </Router>
  );
}
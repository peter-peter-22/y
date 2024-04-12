import React from "react";
import { AboveBreakpoint } from '/src/components/utilities';
import Axios from "axios";
import { Endpoint } from "/src/server.js";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

export default ()=>{
    const isBig = AboveBreakpoint("sm");
    return(
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
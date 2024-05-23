import React from "react";
import { AboveBreakpoint } from '/src/components/utilities';
import Axios from "axios";
import { Endpoint } from "/src/communication.js";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "/src/components/header";
import Footer from "/src/components/footer";

//pages
import Home from "/src/pages/home";
import Notifications from "/src/pages/notifications";
import Error from "/src/pages/error";
import PostFocused from "/src/pages/post_focused";
import Bookmarks from "/src/pages/bookmarks";
import AddFollowers from "/src/pages/follow_people";

export default () => {
  const isBig = AboveBreakpoint("sm");
  return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: isBig ? "center" : "stretch", overflowY: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "row", padding: isBig ? "revert-layer" : 0 }}>
          <Header />
          <div style={isBig ? { width: "500px" } : { flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/posts/:id" element={<PostFocused />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/add_followers" element={<AddFollowers />} />
              <Route path="*" element={<Error />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
  );
}
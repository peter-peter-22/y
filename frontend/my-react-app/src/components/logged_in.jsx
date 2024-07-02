import React from "react";
import { AboveBreakpoint } from '/src/components/utilities';
import Axios from "axios";
import { Endpoint } from "/src/communication.js";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "/src/components/header";
import Footer from "/src/components/footer";
import { Box } from '@mui/material';

//pages
import Home from "/src/pages/home";
import Notifications from "/src/pages/notifications";
import Error from "/src/pages/error";
import PostFocused from "/src/pages/post_focused";
import Bookmarks from "/src/pages/bookmarks";
import AddFollowers from "/src/pages/follow_people";
import Profile from "/src/pages/profile";
import PostEngagements from "/src/pages/post_engagements";
import NotImplemented from "/src/pages/not_implemented";
import Trends from "/src/pages/trendlist";
import Search from "/src/pages/search";

export default () => {
  return (
    <div style={{ display: "flex", flexDirection: "row", padding: 0, overflowY: "scroll", justifyContent: "center" }}>
      <Header />
      <Box sx={{ maxWidth: "500px", flexGrow: 1, overflow: "hidden", borderLeft: 1, borderRight: 1, borderColor: "divider", boxSizing: "border-box",minHeight:"100vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/posts/:id" element={<PostFocused />} />
          <Route path="/posts/:id/*" element={<PostEngagements />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/add_followers" element={<AddFollowers />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/lists" element={<NotImplemented />} />
          <Route path="/communities" element={<NotImplemented />} />
          <Route path="/explore" element={<NotImplemented />} />
          <Route path="/messages" element={<NotImplemented />} />
          <Route path="/premium" element={<NotImplemented />} />
          <Route path="/settings" element={<NotImplemented />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Box>
      <Footer />
    </div>
  );
}
import React from "react";

import { Box } from '@mui/material';
import { Route, Routes } from "react-router-dom";
import Footer from "/src/components/footer";
import Header from "/src/components/header";

//pages
import Bookmarks from "/src/pages/bookmarks";
import Error from "/src/pages/error";
import AddFollowers from "/src/pages/follow_people";
import Home from "/src/pages/home";
import NotImplemented from "/src/pages/not_implemented";
import Notifications from "/src/pages/notifications";
import PostEngagements from "/src/pages/post_engagements";
import PostFocused from "/src/pages/post_focused";
import Profile from "/src/pages/profile_main";
import Search from "/src/pages/search";
import Settings from "/src/pages/settings";
import Trends from "/src/pages/trendlist";

export default () => {
  return (
    <div style={{ display: "flex", flexDirection: "row", padding: 0, justifyContent: "center" }}>
      <Header />
      <Box sx={{ maxWidth: "500px", flexGrow: 1, width:"100%", borderLeft: 1, borderRight: 1, borderColor: "divider", boxSizing: "border-box",minHeight:"100vh"}}>
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
          <Route path="/settings" element={<Settings />} />
          <Route path="/search/*" element={<Search />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Box>
      <Footer />
    </div>
  );
}
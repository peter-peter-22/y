import { Box } from '@mui/material';
import React, { useContext,memo } from "react";
import { Route, Routes, Outlet, useMatch } from "react-router-dom";
import Loading from "/src/components/loading.jsx";
import Footer from "/src/components/footer";
import Header from "/src/components/header";
import { NotifCountProvider } from "/src/components/notification_listener";
import { UserContext } from "/src/components/user_data";

import { Unauthorized } from '/src/pages/error';
import Bookmarks from "/src/pages/bookmarks";
import ChangePassword from "/src/pages/change_password";
import Error from "/src/pages/error";
import Explore from "/src/pages/explore";
import AddFollowers from "/src/pages/follow_people";
import Home from "/src/pages/home";
import NotImplemented from "/src/pages/not_implemented";
import Notifications from "/src/pages/notifications";
import PostEngagements from "/src/pages/post_engagements";
import PostFocused from "/src/pages/post_focused";
import PP from "/src/pages/pp";
import Profile from "/src/pages/profile_main";
import Search from "/src/pages/search";
import Settings from "/src/pages/settings";
import Trends from "/src/pages/trendlist";
import LoggedOut from "/src/components/no_user.jsx";

export default (props) => {
    return (
        <Routes>
            <Route path="/change_password/:user_id/:secret" element={<ChangePassword />} />
            <Route path="/privacy_policy" element={<PP />} />
            {/*<Route path="/login/google" element={<GoogleLogin/>}/>*/}
            <Route path="" element={<AuthTemplate />}>
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
                <Route path="/explore" element={<Explore />} />
                <Route path="/messages" element={<NotImplemented />} />
                <Route path="/premium" element={<NotImplemented />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/search/*" element={<Search />} />
                <Route path="*" element={<Error />} />
            </Route>

            <Route path="*" element={props.children} />
        </Routes>
    );
};

const AuthTemplate = memo(() => {
    //get user data
    const { getData } = useContext(UserContext);

    return (
        !getData ? <Loading /> :
            !getData.user ? <NoUser /> :
                <div style={{ display: "flex", flexDirection: "row", padding: 0, justifyContent: "center" }}>
                    <NotifCountProvider>
                        <Header />
                        <Box sx={{ maxWidth: "600px", flexGrow: 1, width: "100%", borderLeft: 1, borderRight: 1, borderColor: "divider", boxSizing: "border-box", minHeight: "100vh" }}>
                            <Outlet />
                        </Box>
                        <Footer />
                    </NotifCountProvider>
                </div>
    )
},()=>true);

function NoUser() {
    const home = useMatch("/");
    return home ? <LoggedOut /> : <Unauthorized />
}
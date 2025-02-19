import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Loading } from "/src/components/utilities";
import Error from "/src/pages/error";
const AuthTemplate = lazy(() => import("/src/components/auth_template"));

const Bookmarks = lazy(() => import("/src/pages/bookmarks"));
const ChangePassword = lazy(() => import("/src/pages/change_password"));
const Explore = lazy(() => import("/src/pages/explore"));
const AddFollowers = lazy(() => import("/src/pages/follow_people"));
const Home = lazy(() => import("/src/pages/home"));
const NotImplemented = lazy(() => import("/src/pages/not_implemented"));
const Notifications = lazy(() => import("/src/pages/notifications"));
const PostEngagements = lazy(() => import("/src/pages/post_engagements"));
const PostFocused = lazy(() => import("/src/pages/post_focused"));
const PP = lazy(() => import("/src/pages/pp"));
const Profile = lazy(() => import("/src/pages/profile_main"));
const Search = lazy(() => import("/src/pages/search"));
const Settings = lazy(() => import("/src/pages/settings"));
const Trends = lazy(() => import("/src/pages/trendlist"));

export default (props) => {
    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                <Route path="/change_password/:user_id/:secret" element={<ChangePassword />} />
                <Route path="/privacy_policy" element={<PP />} />
                <Route path="/tos" element={<NotImplemented />} />
                <Route path="/cookie_policy" element={<NotImplemented />} />
                <Route path="/accessibility" element={<NotImplemented />} />
                <Route path="/ads_info" element={<NotImplemented />} />
                <Route path="/business" element={<NotImplemented />} />
                <Route path="/blog" element={<NotImplemented />} />
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
        </Suspense>
    );
};
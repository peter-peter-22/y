import React from "react";
import { SimplifiedPostList, WritePost } from "/src/components/posts.jsx";

function FeedList() {
    return <SimplifiedPostList endpoint="member/feed/get_posts" />;
}

function FollowingFeedList() {
    return <SimplifiedPostList endpoint="member/feed/get_followed_posts" />;
}

function ForYou() {
    return (
        <>
            <WritePost />
            <FeedList />
        </>
    )
}
function Following() {
    return (
        <>
            <WritePost />
            <FollowingFeedList />
        </>
    )
}

export { Following, ForYou };

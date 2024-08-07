import React from "react";
import { TabSwitcher } from '/src/components/utilities';
import { SimplifiedPostList, WritePost } from "/src/components/posts.jsx";

function Page() {
  return (
    <TabSwitcher tabs={[
      {
        tabName: "for you",
        text: "For you",
        contents: <ForYou />
      },
      {
        tabName: "following",
        text: "Following",
        contents: <Following />
      }
    ]}>
    </TabSwitcher >
  )
}

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

export default Page

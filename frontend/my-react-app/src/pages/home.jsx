import React from "react";
import { TabSwitcher } from '/src/components/utilities';
import { SimplifiedPostList, WritePost } from "/src/components/posts.jsx";

function Page() {
  return (
    <div>
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
    </div>
  )
}

function FeedList() {
  return <SimplifiedPostList endpoint="member/feed/get_posts" id={"feed"} />;
}

function FollowingFeedList() {
  return <SimplifiedPostList endpoint="member/feed/get_followed_posts" id={"following"} />;
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

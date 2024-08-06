import React from "react";
import { Following, ForYou } from "/src/components/home_pages";
import { TabSwitcher } from '/src/components/utilities';

function Page() {
  return (
      <TabSwitcher tabs={[
        {
          tabName: "for you",
          text: "For you",
          contents: <ForYou/>
        },
        {
          tabName: "following",
          text: "Following",
          contents: <Following/>
        }
      ]}>
      </TabSwitcher >
  )
}

export default Page

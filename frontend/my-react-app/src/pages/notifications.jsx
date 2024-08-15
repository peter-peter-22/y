import React from "react";
import { All } from "/src/components/notifications_pages";
import { TabSwitcher } from '/src/components/utilities';

function Page() {
    return (
        <div>
        <TabSwitcher tabs={[
            {
                text: "All",
                contents: <All />
            },
            {
                text: "Mentions",
                contents: <p>mentions</p>
            }
        ]}>
        </TabSwitcher >
        </div>
    )
}

export default Page
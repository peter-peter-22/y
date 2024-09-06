import React from "react";
import { All } from "/src/components/notifications_pages";
import { TabSwitcher } from '/src/components/utilities';
import NotImplemented from "/src/pages/not_implemented";

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
                    contents: <NotImplemented />
                }
            ]}>
            </TabSwitcher >
        </div>
    )
}

export default Page
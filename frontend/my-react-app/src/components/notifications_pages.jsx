import React,{lazy} from "react";
const NotificationList = lazy(() => import('/src/components/notification_components'));

function All() {
    return (
        <NotificationList />
    );
}

export { All };

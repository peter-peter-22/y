console.log("service worker loaded");

self.addEventListener("push", (event) => {
    //get data from event
    const data=event.data.json();
    const { title, options } = data;
    //show notification
    self.registration.showNotification(title, options);
});

//on click, close the notification and open it's url
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
})
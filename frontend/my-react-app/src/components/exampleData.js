function ExampleUser() {
    return {
        id: -1,
        name: "name",
        username: "username"
    }
}

function ExamplePost() {
    return {
        id: -1,
        repost: false,
        quote: false,
        replying_to: null,
        reposted_post: undefined,
        publisher: ExampleUser(),
        date: new Date("2024-01-01").toISOString(),
        text: "post text",
        images: [default_image],
        view_count: 9999999,
        repost_count: 353,
        like_count: 4242,
        comment_count: 1234423,
        liked_by_user: false,
        bookmark_count: 10,
        bookmarked_by_user: false,
    };
}

function ExampleReply() {
    const post = ExamplePost();
    post.replying_to = post.id;
    post.replied_user = ExampleUser();
    return post;
}

function ExampleQuote() {
    return {
        id: -2,
        repost: false,
        quote: true,
        reposted_post: ExamplePost(),
        publisher: ExampleUser(),
        date: new Date("2024-01-01").toISOString(),
        text: undefined,
        images: undefined,
        views: 0,
        repost_count: 0,
        like_count: 0,
        comment_count: 0,
        liked_by_user: false,
        bookmark_count: 10,
        bookmarked_by_user: false,
    };
}

function ExampleRepost() {
    const reposted_post = ExamplePost();
    return {
        id: reposted_post.id,
        repost: true,
        quote: false,
        reposted_post: ExamplePost(),
        publisher: ExampleUser(),
        date: new Date("2024-01-01").toISOString(),
        text: undefined,
        images: undefined,
        views: 0,
        repost_count: 0,
        like_count: 0,
        comment_count: 0,
        liked_by_user: false,
        bookmark_count: 10,
        bookmarked_by_user: false,
    };
}

function ExampleNotifications() {
    return [
        //like, 1 user
        {
            type: 0,
            users: [ExampleUser()],
            user_count: 1,
            post: ExamplePost()
        },
        //like, multiple users
        {
            type: 0,
            users: [ExampleUser(), ExampleUser(), ExampleUser()],
            user_count: 10,
            post: ExamplePost()
        },
        //like, reply, multiple users
        {
            type: 0,
            users: [ExampleUser(), ExampleUser(), ExampleUser()],
            user_count: 10,
            post: ExampleReply()
        },
        //follow, 1 user
        {
            type: 4,
            users: [ExampleUser()],
            user_count: 1,
        },
        //follow, multiple users
        {
            type: 4,
            users: [ExampleUser(), ExampleUser(), ExampleUser()],
            user_count: 10,
        },
        //reply
        {
            type: 1,
            post: ExampleReply(),
        },
        //repost, 1 user
        {
            type: 2,
            users: [ExampleUser()],
            post: ExamplePost(),
        },
        //repost, multiple users
        {
            type: 2,
            users: [ExampleUser(), ExampleUser(), ExampleUser()],
            user_count: 10,
            post: ExamplePost(),
        },
        //repost, reply, multiple users
        {
            type: 2,
            users: [ExampleUser(), ExampleUser(), ExampleUser()],
            user_count: 10,
            post: ExampleReply(),
        },
    ];
}

const default_profile = "/images/default_profile.jpg";

const default_image = "/images/default_image.jpg";

export { ExampleNotifications, ExamplePost, ExampleQuote, ExampleReply, ExampleRepost, ExampleUser, default_image, default_profile };


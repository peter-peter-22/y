import { Grid } from '@mui/material';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { memo } from "react";
import { ThrowIfNotAxios } from "/src/communication.js";
import { ClickableImage, MediaContext } from "/src/components/post_media";
import { SimplifiedPostList } from "/src/components/posts";
import { GetPostMedia, GetUserName, ListTitle, OnlineList } from '/src/components/utilities';
import { UserListExtended } from "/src/pages/follow_people.jsx";

function Container({ entries: posts }) {
    let medias = []
    posts.forEach(post => {
        medias = medias.concat(GetPostMedia(post));
    });
    return (
        <MediaContext.Provider value={medias}>
            <Grid container spacing={1} columns={{ xs: 1, sm: 2, md: 3 }}>
                {medias.map((media, index) =>
                    <MediaMemo key={index} index={index} />
                )}
            </Grid>
        </MediaContext.Provider>
    );
}

const MediaMemo = memo(({ index }) => {
    return (
        <Grid item xs={1}>
            <ClickableImage index={index} />
        </Grid>
    );
});

function MediaOfUser({ user }) {
    async function GetEntries(from) {
        try {
            const res = await axios.post("member/general/media_of_user", { from: from, user_id: user.id });
            return res.data;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    return (
        <OnlineList getEntries={GetEntries} entryMapController={Container} key={user.id} />
    );
}


function LikesOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="member/general/likes_of_user" params={{ user_id: user_id }} />;
}

function PostsOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="member/general/posts_of_user" params={{ user_id: user_id }} />;
}

function CommentsOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="member/general/comments_of_user" params={{ user_id: user_id }} />;
}

function Followers({ user }) {
    return (
        <Stack direction="column">
            <ListTitle>
                Followers of <GetUserName user={user} />
            </ListTitle>
            <UserListExtended url={"member/general/followers_of_user"} params={{ id: user.id }} />
        </Stack>
    );
}

function Following({ user }) {
    return (
        <Stack direction="column">
            <ListTitle>
                Followed by <GetUserName user={user} />
            </ListTitle>
            <UserListExtended url={"member/general/followed_by_user"} params={{ id: user.id }} />
        </Stack>
    );
}


export { CommentsOfUser, Followers, Following, LikesOfUser, MediaOfUser, PostsOfUser };

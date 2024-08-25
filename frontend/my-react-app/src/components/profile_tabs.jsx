import { Grid } from '@mui/material';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { memo, useCallback } from "react";
import { Loading } from './utilities';
import { ThrowIfNotAxios } from "/src/communication.js";
import { MediaFromFileData } from "/src/components/media";
import { OnlineList } from '/src/components/online_list';
import { ClickableImage, MediaContext } from "/src/components/post_media";
import { SimplifiedPostList } from "/src/components/posts";
import { GetUserName, ListTitle } from '/src/components/utilities';
import { UserListExtended } from "/src/pages/follow_people.jsx";

function ImageGrid({ items, allRows, virtualizer }) {
    return (
        <MediaContext.Provider value={allRows}>
            <Grid container spacing={1} columns={virtualizer.options.lanes}>
                {
                    items.map((virtualRow) => {
                        const isLoaderRow = virtualRow.index > allRows.length - 1
                        return (
                            <Grid item
                                xs={1}
                                key={virtualRow.key}
                                ref={virtualizer.measureElement}
                                data-index={virtualRow.index}
                            >
                                {isLoaderRow ?
                                    <Loading />
                                    :
                                    <MediaMemo
                                        index={virtualRow.index}
                                    />
                                }
                            </Grid>
                        )
                    })
                }
            </Grid>
        </MediaContext.Provider>
    )
}

const MediaMemo = memo(({ index }) => {
    return (
        <ClickableImage index={index} />
    );
});

function MediaOfUser({ user }) {
    async function GetEntries(from) {
        try {
            const res = await axios.post("member/general/media_of_user", { from: from, user_id: user.id });
            res.data.forEach((row) => {
                //convert media object to media class
                if (row.media)
                    row.media = row.media.map(el => MediaFromFileData(el));
            });
            return res.data;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    const entryArranger = useCallback((data) => {
        return data.pages.flatMap((d) => {
            return d.rows.flatMap(row => row.media);
        });
    });

    return (
        <OnlineList
            getEntries={GetEntries}
            key={user.id}
            id={"media_of_" + user.id}
            scrollRestoration={false}
            virtualizerProps={{ lanes: 3 }}
            entryArranger={entryArranger}
            Displayer={ImageGrid}
            exampleHeight={202}
        />
    );
}


function LikesOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="member/general/likes_of_user" params={{ user_id: user_id }} id={"likes" + user_id} scrollRestoration={false} />;
}

function PostsOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="member/general/posts_of_user" params={{ user_id: user_id }} id={"posts" + user_id} scrollRestoration={false} />;
}

function CommentsOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="member/general/comments_of_user" params={{ user_id: user_id }} id={"comments" + user_id} scrollRestoration={false} />;
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


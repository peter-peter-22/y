import { Typography } from "@mui/material";
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { LinkButton } from "/src/components/buttons";
import { FollowDialogExtended, UserListExtended } from "/src/components/follow_dialogs";
import { SimplifiedPostList } from "/src/components/posts";
import { ScrollToTop } from "/src/components/scroll_to_top";
import { GetSearchText } from "/src/components/search_components";
import { ListTitle, Loading } from "/src/components/utilities";

export default () => {
    ScrollToTop();
    const text = GetSearchText();

    return (
        <Routes>
            <Route path="/" element={<Main text={text} />} />
            <Route path="/users" element={<UsersList text={text} />} />
        </Routes>
    )
};

function UsersPreview({ text }) {
    const [getUsers, setUsers] = useState();

    async function Download() {
        const res = await axios.post("member/search/people_preview", {
            text: text
        });
        setUsers(res.data);
    }

    useEffect(() => {
        Download();
    }, [text]);

    return (
        <Stack direction="column">
            <ListTitle>
                Users
            </ListTitle>
            {getUsers !== undefined ?
                (
                    getUsers.length === 0 ?
                        <NotFound>
                            No users found
                        </NotFound>
                        :
                        <>
                            <List sx={{ p: 0 }} >
                                {getUsers.map((user, i) => <FollowDialogExtended entry={user} key={i} />)}
                                <LinkButton to={"/search/users?q=" + text}>
                                    Show more
                                </LinkButton>
                            </List>
                        </>
                )
                :
                <Loading />
            }
        </Stack>
    );
}

function UsersList({ text }) {
    return (
        <UserListExtended url={"member/search/people_list"} params={{ text: text }} />
    );
}

function NotFound({ children }) {
    return (
        <Typography variant="medium_fade" sx={{ m: 2 }}>
            {children}
        </Typography>
    );
}

function Posts({ text }) {
    return (
        <Stack direction="column">
            <ListTitle>
                Posts
            </ListTitle>
            <SimplifiedPostList endpoint="member/search/posts" params={{ text: text }} id={"search_of_" + text} />
        </Stack>
    );
}

function Main({ text }) {
    return (
        <>
            <UsersPreview text={text} />
            <Posts text={text} />
        </>
    );
}
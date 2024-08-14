import { Typography } from "@mui/material";
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { LinkButton } from "/src/components/buttons";
import { SimplifiedPostList } from "/src/components/posts";
import { ListTitle, Loading } from "/src/components/utilities";
import { FollowDialogExtended, UserListExtended } from "/src/pages/follow_people";

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
}

function GetSearchText() {
    const query = useQuery();
    const text = query.get("q");
    return text;
}

export default () => {
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
            <SimplifiedPostList endpoint="member/search/posts" params={{ text: text }} id={"search_of" + text} />
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

function GetSearchUrl(text) {
    return "/search?q=" + text;
}

export { GetSearchText, GetSearchUrl };

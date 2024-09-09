import Stack from '@mui/material/Stack';
import React, { useEffect } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { SimplifiedPostList } from "/src/components/posts";
import { ListTitle, TabSwitcherLinks } from '/src/components/utilities';

import { UserListExtended } from "/src/components/follow_dialogs";

function TabSelector() {
    const { id } = useParams();
    useEffect(() => { }, [id]);

    function Likes() {
        const url = "member/general/likers_of_post";
        return (
            <UserListExtended url={url} params={{ post_id: id }} />
        );
    }

    function Reposts() {
        return <SimplifiedPostList endpoint="member/general/reposts_of_post" params={{ post_id: id }} id={"reposts"+id}/>;
    }

    function Quotes() {
        return <SimplifiedPostList endpoint="member/general/quotes_of_post" params={{ post_id: id }} id={"quotes"+id}/>;
    }

    const baseUrl = "/posts/" + id;
    return (
        <Stack direction="column" >
            <ListTitle>
                Post engagements
            </ListTitle>
            <TabSwitcherLinks tabs={[
                {
                    text: "Likes",
                    link: baseUrl + "/likes"
                },
                {
                    text: "Reposts",
                    link: baseUrl + "/reposts"
                },
                {
                    text: "Quotes",
                    link: baseUrl + "/quotes"
                }
            ]} />
            <Routes>
                <Route path="/likes" element={<Likes />} />
                <Route path="/reposts" element={<Reposts />} />
                <Route path="/quotes" element={<Quotes />} />
            </Routes>
        </Stack>
    );
}

export default TabSelector;
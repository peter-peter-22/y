import Stack from '@mui/material/Stack';
import React from "react";
import { SimplifiedPostList } from "/src/components/posts.jsx";
import { ListTitle } from '/src/components/utilities';

function BookmarkList() {
    return <SimplifiedPostList endpoint="member/general/get_bookmarks" id={"bookmarks"}/>;
}

function Bookmarks() {
    return (
        <Stack direction="column">
            <ListTitle>
                Bookmarks
            </ListTitle>
            <BookmarkList />
        </Stack>
    )
}

export default Bookmarks;
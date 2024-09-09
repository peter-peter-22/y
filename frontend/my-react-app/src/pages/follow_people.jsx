import Stack from '@mui/material/Stack';
import React from "react";
import { UserListNormal } from "/src/components/follow_dialogs";
import { ListTitle } from '/src/components/utilities';

function FollowableList() {
    return (
        <Stack direction="column">
            <ListTitle>
                Who to follow
            </ListTitle>
            <UserListNormal url="member/general/follower_recommendations" />
        </Stack>
    );
}

export default FollowableList;
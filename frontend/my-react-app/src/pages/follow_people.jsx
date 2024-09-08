import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import axios from "axios";
import React, { memo } from "react";
import { ThrowIfNotAxios } from "/src/communication.js";
import { FollowDialog, ListTitle } from '/src/components/utilities';
import { OnlineList } from "/src/components/online_list";

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
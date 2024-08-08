import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import axios from "axios";
import React, { memo } from "react";
import { ThrowIfNotAxios } from "/src/communication.js";
import { FollowDialog, ListTitle, OnlineList } from '/src/components/utilities';

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

function UserListNormal({ url, params }) {
    return (
        <UserListAny url={url} params={params} entryMapper={FollowDialogMemo} />
    );
}


const FollowDialogMemo = memo(({ entry: user }) => {
    return (
        <FollowDialog user={user} />
    );
});

const FollowDialogExtended = memo(({ entry: user }) => {
    return (
        <FollowDialog user={user} >
            <Typography variant="small" sx={{ mt: 1 }}>
                {user.bio}
            </Typography>
        </FollowDialog>
    );
});

//extended because this additionally displays the user bio
function UserListExtended({ url, params }) {
    return (
        <UserListAny url={url} params={params} entryMapper={FollowDialogExtended} />
    );
}

function UserListAny({ url, params: additionalParams, entryMapper }) {
    async function GetEntries(from, timestamp) {
        try {
            let params = { from, timestamp };
            if (additionalParams) params = { ...params, ...additionalParams };

            const response = await axios.post(url, params);
            return response.data;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    return (
        <OnlineList getEntries={GetEntries} EntryMapper={entryMapper} />
    );
}


export default FollowableList;
export { FollowDialogExtended, UserListExtended };

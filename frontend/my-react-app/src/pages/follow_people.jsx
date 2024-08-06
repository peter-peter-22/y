import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import axios from "axios";
import React, { memo } from "react";
import { ThrowIfNotAxios } from "/src/communication.js";
import { FollowDialog, ListTitle, OnlineList } from '/src/components/utilities';

function FollowableList() {
    async function GetEntries(from) {
        try {
            const response = await axios.post("member/general/follower_recommendations", {
                from: from
            });
            return response.data;
        }
        catch (err) {
            console.error(err);
            return [];
        }
    }

    function EntryMapper(props) {
        return (<FollowDialog user={props.entry} />);
    }
    return (
        <Stack direction="column">
            <ListTitle>
                Who to follow
            </ListTitle>
            <OnlineList getEntries={GetEntries} EntryMapper={EntryMapper} />
        </Stack>
    );
}

const FollowDialogExtended = memo(({ entry: user }) => {
    return (
        <FollowDialog user={user} >
            <Typography variant="small" sx={{ mt: 1 }}>
                {user.bio}
            </Typography>
        </FollowDialog>
    );
});

//extended because this additionally displays the user bio, and accepts more url parameters
function UserListExtended({ url, params: additionalParams }) {
    async function GetEntries(from) {
        try {
            let params = { from: from };
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
        <OnlineList getEntries={GetEntries} EntryMapper={FollowDialogExtended} />
    );
}


export default FollowableList;
export { FollowDialogExtended, UserListExtended };

import React, { useState, useEffect, memo } from "react";
import Stack from '@mui/material/Stack';
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, OnlineList, FollowDialog, ListTitle } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton } from "/src/components/buttons.jsx";
import axios from "axios";
import { Endpoint, FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";

function FollowableList() {
    async function GetEntries(from) {
        try {
            const response = await axios.post(Endpoint("/member/general/follower_recommendations"), {
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
export { UserListExtended };
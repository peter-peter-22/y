import React, { useState, useEffect } from "react";
import Stack from '@mui/material/Stack';
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, default_image, GetPostPictures, OnlineList, FollowDialog } from '/src/components/utilities';
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
import { Endpoint, FormatAxiosError } from "/src/communication.js";

function FollowableList(props) {
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
        <List sx={{ p: 0 }}>
            <OnlineList getEntries={GetEntries} entryMapper={EntryMapper} />
        </List>
    );
}

function UserListExtended(props) {
    async function GetEntries(from) {
        try {
            let params = { from: from };
            const additional = props.params;
            if (additional) params = { ...params, ...additional };

            const response = await axios.post(props.url, params);
            return response.data;
        }
        catch (err) {
            console.error(err);
            return [];
        }
    }

    function EntryMapper(props) {
        const user = props.entry;
        return (
            <FollowDialog user={user} >
                <Typography variant="small" sx={{mt:1}}>
                    {user.bio}
                </Typography>
            </FollowDialog>
        );
    }
    return (
        <List sx={{ p: 0 }}>
            <OnlineList getEntries={GetEntries} entryMapper={EntryMapper} />
        </List>
    );
}


export default FollowableList;
export { UserListExtended };
import React, { useState, useEffect } from "react";
import Stack from '@mui/material/Stack';
import SideMenu, { Inside } from "./side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton } from "/src/components/buttons.jsx";
import { SimplifiedPostList, WritePost } from "/src/components/posts.jsx";
import axios from "axios";
import { Endpoint, FormatAxiosError } from "/src/communication.js";

function FeedList() {
    return <SimplifiedPostList endpoint="/member/feed/get_posts" />;
}

function FollowingFeedList() {
    return <SimplifiedPostList endpoint="/member/feed/get_followed_posts" />;
}

function ForYou() {
    return (
        <>
            <WritePost />
            <FeedList />
        </>
    )
}
function Following() {
    return (
        <>
            <WritePost />
            <FollowingFeedList />
        </>
    )
}

export { ForYou, Following };
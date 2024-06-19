import React, { useState, useRef, useEffect, forwardRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Stack from '@mui/material/Stack';
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, OnlineList, SimplePopOver, formatNumber, TabSwitcherLinks, Loading, GetProfileBanner } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton } from "/src/components/buttons.jsx";
import { Grid } from '@mui/material';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { theme } from "/src/styles/mui/my_theme";
import { PlainTextField, PasswordFieldWithToggle, VisuallyHiddenInput } from "/src/components/inputs";
import { UserData } from "/src/App.jsx";
import config from "/src/components/config.js";
import axios from 'axios';
import { Endpoint, FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import { Error, Modals, ShowImage } from "/src/components/modals";
import { useNavigate } from "react-router-dom";
import { WhoToFollow } from "/src/components/footer";
import Moment from "moment";
import { SimplifiedPostList } from "/src/components/posts";
import { useParams } from "react-router-dom";
import { ProfilePicEditor, ChangeablePicture, UserNameEditor, NameEditor, BirthDateEditor } from "/src/components/create_account";
import { UserListExtended } from "/src/pages/follow_people";

function TabSelector() {
    const { id } = useParams();
    useEffect(() => { }, [id]);

    function Likes() {
        const url = Endpoint("/member/general/likers_of_post");
        return (
            <UserListExtended url={url} params={{ post_id: id }} />
        );
    }

    function Reposts() {
        return <SimplifiedPostList endpoint="/member/general/reposts_of_post" params={{ post_id: id }} />;
    }

    function Quotes() {
        return <SimplifiedPostList endpoint="/member/general/quotes_of_post" params={{ post_id: id }} />;
    }

    const baseUrl = "/posts/" + id;
    return (
        <Stack direction="column" >
            <Typography variant="big_bold" sx={{ my: 2, mx: 7 }}>
                Post engagements
            </Typography>
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
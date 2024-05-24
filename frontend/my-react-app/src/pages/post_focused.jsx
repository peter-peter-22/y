import React, { useState, useRef, useEffect } from "react";
import Stack from '@mui/material/Stack';
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, default_image, GetPostPictures, Loading } from '/src/components/utilities';
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
import { Endpoint, FormatAxiosError } from "/src/communication.js";
import { Error, Modals, ShowImage } from "/src/components/modals";
import { useParams } from "react-router-dom";
import { PostFocused, AddDataToPost, CommentList, OverrideWithRepost } from "/src/components/posts.jsx";

export default () => {
    const [post, setPost] = useState();
    const { id } = useParams();

    useEffect(() => { getPost(); }, [id]);
    async function getPost() {
        try {
            const result = await axios.post(Endpoint("/member/get_post"), {
                id: id
            });
            const main_post = result.data;
            AddDataToPost(main_post);
            setPost(main_post);
        }
        catch (err) { console.log(err) }
    }

    if (post) {
        const overriden = OverrideWithRepost(post);
        return (
            <List sx={{ p: 0 }} key={id}>
                <PostFocused post={post} />
                <CommentList post={overriden} />
            </List>
        );
    }
    else
        return <Loading />;
};
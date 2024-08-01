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
import { ResponsiveSelector, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, Loading } from '/src/components/utilities';
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
import { UserData } from "/src/components/user_data";
import config from "/src/components/config.js";
import axios from 'axios';
import {  FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import { Error, Modals, ShowImage } from "/src/components/modals";
import { useParams } from "react-router-dom";
import { PostFocused, SimplifiedPostList, OverrideWithRepost } from "/src/components/posts.jsx";
import { ErrorPage } from "/src/pages/error";

let focused_id = undefined;
function get_focused_id() {
    return focused_id;
}

export default () => {
    const [post, setPost] = useState();
    const { id } = useParams();
    const [error, setError] = useState(false);

    useEffect(getPost, [id]);

    function getPost() {
        //set the focused id on mounth
        focused_id = id;

        //get and process post
        (async() => {
            try {
                //get post from server
                const result = await axios.post("member/general/get_post", {
                    id: id
                });
                //if success, update state
                const main_post = result.data;
                setPost(main_post);
            }
            catch (err) {
                //if fail, display error
                setError(true);
                ThrowIfNotAxios(err);
            }
        })();

        //clear focused id on dismounth
        return () => {
            focused_id=undefined;
        }
    }

    if (post) {
        post.setPost=setPost;
        const overriden = OverrideWithRepost(post);
        return (
            <List sx={{ p: 0 }}>
                <PostFocused post={post} />
                <CommentList post={overriden} />
            </List>
        );
    }
    else if (error) {
        return <ErrorPage text={"This post does not exists"} />
    }
    else
        return <Loading />;
};

function CommentList({ post }) {
    const id = post.id;
    return <SimplifiedPostList endpoint="member/general/get_comments" params={{ id: id }} key={id} post={post} />;
}

export { get_focused_id };
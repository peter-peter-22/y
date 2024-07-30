import React, { useState, useRef, useEffect, forwardRef, memo } from "react";
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
import { ResponsiveSelector, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, GetPostMedia, OnlineList, SimplePopOver, formatNumber, TabSwitcherLinks, Loading, ProfilePic, ListTitle } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { CornerButton } from "/src/components/buttons.jsx";
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
import { useNavigate } from "react-router-dom";
import { WhoToFollow } from "/src/components/footer";
import Moment from "moment";
import { SimplifiedPostList, PostModalFrame } from "/src/components/posts";
import { useParams } from "react-router-dom";
import { ProfilePicEditor, ChangeablePicture, UserNameEditor, NameEditor, BirthDateEditor } from "/src/components/create_account";
import { ManageProfile } from "/src/components/manage_content_button.jsx";
import { Media, mediaTypes } from "/src/components/media";
import { ImageDisplayer, MediaDisplayer } from "/src/components/media";
import { UserListExtended } from "/src/pages/follow_people.jsx";
import {ClickableImage,MediaContext} from "/src/components/post_media";

function Container({ entries: posts }) {
    let medias = []
    posts.forEach(post => {
        medias = medias.concat(GetPostMedia(post));
    });
    return (
        <MediaContext.Provider value={medias}>
            <Grid container spacing={1} columns={{ xs: 1, sm: 2, md: 3 }}>
                {medias.map((media, index) =>
                    <MediaMemo key={index} index={index} />
                )}
            </Grid>
        </MediaContext.Provider>
    );
}

const MediaMemo = memo(({ index }) => {
    return (
        <Grid item xs={1}>
            <ClickableImage index={index} />
        </Grid>
    );
});

function MediaOfUser({ user }) {
    async function GetEntries(from) {
        try {
            const res = await axios.post("/member/general/media_of_user", { from: from, user_id: user.id });
            return res.data;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    return (
        <OnlineList getEntries={GetEntries} entryMapController={Container} key={user.id} />
    );
}


function LikesOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="/member/general/likes_of_user" params={{ user_id: user_id }} />;
}

function PostsOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="/member/general/posts_of_user" params={{ user_id: user_id }} />;
}

function CommentsOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="/member/general/comments_of_user" params={{ user_id: user_id }} />;
}

function Followers({ user }) {
    return (
        <Stack direction="column">
            <ListTitle>
                Followers of <GetUserName user={user} />
            </ListTitle>
            <UserListExtended url={"/member/general/followers_of_user"} params={{ id: user.id }} />
        </Stack>
    );
}

function Following({ user }) {
    return (
        <Stack direction="column">
            <ListTitle>
                Followed by <GetUserName user={user} />
            </ListTitle>
            <UserListExtended url={"/member/general/followed_by_user"} params={{ id: user.id }} />
        </Stack>
    );
}


export { Followers, Following, LikesOfUser, CommentsOfUser, PostsOfUser, MediaOfUser };
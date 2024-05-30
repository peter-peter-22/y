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
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, BoldLink, UserLink, DateLink, TextRow, GetUserName, GetUserKey, ReplyingTo, GetProfilePicture,OnlineList } from '/src/components/utilities';
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
import { PlainTextField } from "/src/components/inputs";
import { Post, PostList, PostFocused, ListBlockButton, ListBlock, RowWithPrefix, PostButtonRow, ExampleUser, ExamplePost, ExampleReply, OpenPostOnClick, OpenOnClick } from "/src/components/posts";
import { Endpoint, FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import axios from 'axios';
import { UserData } from "/src/App.jsx";

const spacing = 1.5;

function Like(props) {
    const data = props.data;
    return (
        <ListBlockButton>
            <OpenPostOnClick id={data.post_id}>
                <Stack direction="column" spacing={spacing}>
                    <RowWithPrefix
                        prefix={<SmallIcon color={theme.palette.colors.like} icon="favorite" />}
                        contents={
                            <UserBalls users={data.users} />
                        }
                    />
                    <RowWithPrefix
                        contents={
                            <Stack direction="column" spacing={spacing} style={{ overflow: "hidden" }}>
                                <UserCounter data={data} after={"liked your " + ReplyOrPost(data.post)} />
                                <Typography variant="small_fade">
                                    {data.post.text}
                                </Typography>
                            </Stack>
                        }
                    />
                </Stack>
            </OpenPostOnClick>        </ListBlockButton>
    );
}

function ReplyOrPost(post) {
    if (post.replying_to !== null)
        return "reply";
    else
        return "post";
}

function Follow(props) {
    const data = props.data;
    const link = "/profile/" + data.users[0].id;
    return (
        <ListBlockButton>
            <OpenOnClick link={link}>
                <Stack direction="column" spacing={spacing}>
                    <RowWithPrefix
                        prefix={<SmallIcon color={theme.palette.primary.main} icon="person" />}
                        contents={
                            <UserBalls users={data.users} />
                        }
                    />
                    <RowWithPrefix
                        contents={
                            <Stack direction="column" spacing={spacing} style={{ overflow: "hidden" }}>
                                <UserCounter data={data} after="followed you" />
                            </Stack>
                        }
                    />
                </Stack>
            </OpenOnClick>
        </ListBlockButton>
    );
}

function UserCounter(props) {
    const data = props.data;
    return (
        <TextRow>
            <UserLink user={data.users[0]} />
            {data.user_count > 1 && <Typography variant="small" style={{ flexShrink: 0, ...noOverflow }}>and {data.user_count - 1} others</Typography>}
            <Typography variant="small" style={{ flexShrink: 0, ...noOverflow }}>{props.after}</Typography>
        </TextRow>
    );
}

function UserBalls(props) {
    return (
        <Stack direction="row" spacing={1}>
            {props.users.map((user, i) => <SmallAvatar src={GetProfilePicture(user)} key={i} />)}
        </Stack>
    );
}

function Repost(props) {
    const data = props.data;
    return (
        <ListBlockButton>
            <OpenPostOnClick id={data.post_id}>
                <Stack direction="column" spacing={spacing}>
                    <RowWithPrefix
                        prefix={<SmallIcon color={theme.palette.colors.share} icon="loop" />}
                        contents={
                            <UserBalls users={data.users} />
                        }
                    />
                    <RowWithPrefix
                        contents={
                            <Stack direction="column" spacing={spacing} style={{ overflow: "hidden" }}>
                                <UserCounter data={data} after={"reposted your " + ReplyOrPost(data.post)} />
                                <Typography variant="small_fade">
                                    {data.post.text}
                                </Typography>
                            </Stack>
                        }
                    />
                </Stack>
            </OpenPostOnClick>
        </ListBlockButton>
    );
}

function SmallIcon(props) {
    return (
        <Icon style={{ color: props.color, fontSize: "25px", alignSelf: "center" }}>{props.icon}</Icon>
    );
}

function Comment(props) {
    const post = props.data.post;
    post.replied_user = UserData.getData.user;
    return (
        <Post post={post} />
    );
}

function SmallAvatar(props) {
    return (
        <Avatar sx={{ width: "30px", height: "30px" }} src={props.src} />
    );
}

const notificationTypes = {
    like: 0,
    reply: 1,
    repost: 2,
    follow: 4
}

function ExampleNotifications() {
    return [
        //like, 1 user
        {
            type: 0,
            users: [ExampleUser()],
            user_count: 1,
            post: ExamplePost()
        },
        //like, multiple users
        {
            type: 0,
            users: [ExampleUser(), ExampleUser(), ExampleUser()],
            user_count: 10,
            post: ExamplePost()
        },
        //like, reply, multiple users
        {
            type: 0,
            users: [ExampleUser(), ExampleUser(), ExampleUser()],
            user_count: 10,
            post: ExampleReply()
        },
        //follow, 1 user
        {
            type: 4,
            users: [ExampleUser()],
            user_count: 1,
        },
        //follow, multiple users
        {
            type: 4,
            users: [ExampleUser(), ExampleUser(), ExampleUser()],
            user_count: 10,
        },
        //reply
        {
            type: 1,
            post: ExampleReply(),
        },
        //repost, 1 user
        {
            type: 2,
            users: [ExampleUser()],
            post: ExamplePost(),
        },
        //repost, multiple users
        {
            type: 2,
            users: [ExampleUser(), ExampleUser(), ExampleUser()],
            user_count: 10,
            post: ExamplePost(),
        },
        //repost, reply, multiple users
        {
            type: 2,
            users: [ExampleUser(), ExampleUser(), ExampleUser()],
            user_count: 10,
            post: ExampleReply(),
        },
    ];
}

function NotificationList(props) {
    async function download(from) {
        try {
            const res = await axios.post(Endpoint("/member/notifications/get"), { from: from });
            return res.data;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    function Notification(props) {
        const data = props.entry;
        const type = data.type;
        switch (type) {
            case notificationTypes.like:
                return <Like data={data} />;
            case notificationTypes.reply:
                return <Comment data={data} />
            case notificationTypes.repost:
                return <Repost data={data} />
            case notificationTypes.follow:
                return <Follow data={data} />;
            default:
                return "invalid notification type";
        }
    }
    return (
        <OnlineList getEntries={download} entryMapper={Notification} />
    );
}

export { NotificationList };
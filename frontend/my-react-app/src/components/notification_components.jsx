import React, { useState, useEffect, memo } from "react";
import Stack from '@mui/material/Stack';
import { Inside } from "./side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText, FadeLink, UserName, UserKey, noOverflow, BoldLink, UserLink, DateLink, TextRow, GetUserName, GetUserKey, ReplyingTo, GetProfilePicture, OnlineList, AvatarImageDisplayer, ListTitle, ProfilePic } from '/src/components/utilities';
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
import { BorderlessPost, PostList, PostFocused, ListBlockButton, ListBlock, RowWithPrefix, PostButtonRow, OpenPostOnClick, OpenOnClick } from "/src/components/posts";
import {  FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import axios from 'axios';
import { UserData } from "/src/components/user_data";

const spacing = 1.5;

function NotificationBase({ seen, children }) {
    return (
        <ListBlockButton selected={!seen}>
            {children}
        </ListBlockButton>
    );
}

function Like({data}) {
    return (
        <NotificationBase seen={data.seen}>
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
            </OpenPostOnClick>
        </NotificationBase>
    );
}

function ReplyOrPost(post) {
    if (post.replying_to !== null)
        return "reply";
    else
        return "post";
}

function Follow({data}) {
    console.log(data);
    const link = "/profile/" + data.users[0].id;
    return (
        <NotificationBase seen={data.seen}>
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
        </NotificationBase>
    );
}

function UserCounter({ data, after }) {
    const count = data.count;
    return (
        <TextRow>
            <UserLink user={data.users[0]} />
            {count > 1 && <Typography variant="small" style={{ flexShrink: 0, ...noOverflow }}>and {count - 1} others</Typography>}
            <Typography variant="small" style={{ flexShrink: 0, ...noOverflow }}>{after}</Typography>
        </TextRow>
    );
}

function UserBalls(props) {
    return (
        <Stack direction="row" spacing={1}>
            {props.users.map((user, i) => <SmallAvatar user={user} key={i} />)}
        </Stack>
    );
}

function Repost({data}) {
    return (
        <NotificationBase seen={data.seen}>
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
        </NotificationBase>
    );
}

function SmallIcon(props) {
    return (
        <Icon style={{ color: props.color, fontSize: "25px", alignSelf: "center" }}>{props.icon}</Icon>
    );
}

function Comment({data}) {
    const post = data.comment;
    return (
        <NotificationBase seen={data.seen}>
            <BorderlessPost post={post} />
        </NotificationBase>
    );
}

function SmallAvatar({ user }) {
    return (
        <ProfilePic sx={{ width: "30px", height: "30px" }} user={user} />
    );
}

function InvalidNotification() {
    return (
        <ListItem>
            invalid notification type
        </ListItem>
    );
}

const notificationTypes = {
    like: "like",
    reply: "comment",
    repost: "repost",
    follow: "follow"
}

const Notification = memo(({ entry: data }) => {
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
            return <InvalidNotification />;
    }
});

function NotificationList() {
    async function download(from) {
        try {
            const res = await axios.post("member/notifications/get", { from: from });
            return res.data;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    return (
        <OnlineList getEntries={download} EntryMapper={Notification} />
    );
}

export { NotificationList };
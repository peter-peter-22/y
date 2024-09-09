import { Icon, Typography } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { memo } from "react";
import { BorderlessPost, ListBlockButton, OpenOnClick, OpenPostOnClick, RowWithPrefix } from "/src/components/posts";
import { ProfilePic, TextRow, UserLink, noOverflow } from '/src/components/utilities';
import { theme } from "/src/styles/mui/my_theme";
import { OnlineList } from "/src/components/online_list";
import SvgIcon from '@mui/material/SvgIcon';

import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import LoopIcon from "@mui/icons-material/Loop";

const spacing = 1.5;

function NotificationBase({ seen, children }) {
    return (
        <ListBlockButton selected={!seen}>
            {children}
        </ListBlockButton>
    );
}

function Like({ data }) {
    return (
        <NotificationBase seen={data.seen}>
            <OpenPostOnClick id={data.post_id}>
                <Stack direction="column" spacing={spacing}>
                    <RowWithPrefix
                        prefix={<SmallIcon color={theme.palette.colors.like} icon={<FavoriteIcon />} />}
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

function Follow({ data }) {
    const link = "/profile/" + data.users[0].id;
    return (
        <NotificationBase seen={data.seen}>
            <OpenOnClick link={link}>
                <Stack direction="column" spacing={spacing}>
                    <RowWithPrefix
                        prefix={<SmallIcon color={theme.palette.primary.main} icon={<PersonIcon />} />}
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

function Repost({ data }) {
    return (
        <NotificationBase seen={data.seen}>
            <OpenPostOnClick id={data.post_id}>
                <Stack direction="column" spacing={spacing}>
                    <RowWithPrefix
                        prefix={<SmallIcon color={theme.palette.colors.share} icon={<LoopIcon />} />}
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
        <SvgIcon style={{ color: props.color, fontSize: "25px", alignSelf: "center" }}>{props.icon}</SvgIcon>
    );
}

function Comment({ data }) {
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

    if (type !== notificationTypes.reply && data.users.length === 0)
        return;//the users those caused this notification were deleted. don't display the notification to avoid error

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
    async function download(from, timestamp) {
        const res = await axios.post("member/notifications/get", { from, timestamp });
        return res.data;
    }

    return (
        <OnlineList
            getEntries={download}
            EntryMapper={Notification}
            id={"notifs"}
            exampleSize={100}
        />

    );
}

export { NotificationList };

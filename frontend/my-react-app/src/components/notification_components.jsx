import React from "react";
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
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, BoldLink, UserLink, DateLink, TextRow, UserKeyLink, GetUserName, GetUserKey, ReplyingTo } from '/src/components/utilities';
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
import { Post, PostList, PostFocused, ListBlockButton, ListBlock, RowWithPrefix, PostButtonRow } from "/src/components/posts";

const spacing = 1.5;

function Like(props) {
    return (
        <ListBlockButton>
            <Stack direction="column" spacing={spacing}>
                <RowWithPrefix
                    prefix={<SmallIcon color={theme.palette.colors.like} icon="favorite" />}
                    contents={
                        <Stack direction="row" spacing={1}>
                            <SmallAvatar />
                            <SmallAvatar />
                        </Stack>
                    }
                />
                <RowWithPrefix
                    contents={
                        <Stack direction="column" spacing={spacing} style={{ overflow: "hidden" }}>
                            <TextRow >
                                <UserLink />
                                <Typography variant="small" style={{ flexShrink: 0, ...noOverflow }}>liked your reply</Typography>
                            </TextRow>
                            <Typography variant="small_fade">
                                poist test gdfjdfgfg jgd njjdgf jkdgfjgfd jkngdfjnkdjgfkndjgf knj kdgfnjdkngfjnkdgfjnkdgfjkndjkndjknd gfjkndgfjknd gfjknjdgfjkndgfjkndjkgnf
                            </Typography>
                        </Stack>
                    }
                />
            </Stack>
        </ListBlockButton>
    );
}

function Follow(props) {
    return (
        <ListBlockButton>
            <Stack direction="column" spacing={spacing}>
                <RowWithPrefix
                    prefix={<SmallIcon color={theme.palette.primary.main} icon="person" />}
                    contents={
                        <SmallAvatar />
                    }
                />
                <RowWithPrefix
                    contents={
                        <Stack direction="column" spacing={spacing} style={{ overflow: "hidden" }}>
                            <TextRow>
                                <UserLink />
                                <Typography variant="small" style={{ flexShrink: 0, ...noOverflow }}>followed you</Typography>
                            </TextRow>
                        </Stack>
                    }
                />
            </Stack>
        </ListBlockButton>
    );
}

function ShareReply(props) {
    return (
        <ListBlockButton>
            <Stack direction="column" spacing={spacing}>
                <RowWithPrefix
                    prefix={<SmallIcon color={theme.palette.colors.share} icon="loop" />}
                    contents={
                        <SmallAvatar />
                    }
                />
                <RowWithPrefix
                    contents={
                        <Stack direction="column" spacing={spacing} style={{ overflow: "hidden" }}>
                            <TextRow>
                                <UserLink />
                                <Typography variant="small" style={{ flexShrink: 0, ...noOverflow }}>reposted your reply</Typography>
                            </TextRow>
                            <Typography variant="small_fade">
                                poist test gdfjdfgfg jgd njjdgf jkdgfjgfd jkngdfjnkdjgfkndjgf knj kdgfnjdkngfjnkdgfjnkdgfjkndjkndjknd gfjkndgfjknd gfjknjdgfjkndgfjkndjkgnf
                            </Typography>
                        </Stack>
                    }
                />
            </Stack>
        </ListBlockButton>
    );
}

function SmallIcon(props) {
    return (
        <Icon style={{ color: props.color, fontSize: "25px", alignSelf: "center" }}>{props.icon}</Icon>
    );
}

function Comment(props) {
    return (
        <ListBlockButton>
            <Stack direction="column" spacing={spacing} style={{ overflow: "hidden" }}>
                <RowWithPrefix
                    prefix={<Avatar src="/images/example profile.jpg" />}
                    contents={
                        <Stack direction="column" style={{ overflow: "hidden" }}>
                            <TextRow>
                                <ProfileText row="true" link="true" />
                                ·
                                <DateLink short />
                            </TextRow>
                            <ReplyingTo />
                            <Typography variant="small">
                                poist test gdfjdfgfg jgd njjdgf jkdgfjgfd jkngdfjnkdjgfkndjgf knj kdgfnjdkngfjnkdgfjnkdgfjkndjkndjknd gfjkndgfjknd gfjknjdgfjkndgfjkndjkgnf
                            </Typography>
                            <Box my={1}>
                                <PostButtonRow />
                            </Box>
                        </Stack>
                    }
                />
            </Stack>
        </ListBlockButton>
    );
}

function SmallAvatar(props) {
    return (
        <Avatar sx={{ width: "30px", height: "30px" }} src="/images/example profile.jpg" />
    );
}

function NotificationList(props) {
    return (
        <List sx={{ p: 0 }}>
            <Like />
            <Comment />
            <Follow />
            <ShareReply />
        </List>
    );
}

export { NotificationList };
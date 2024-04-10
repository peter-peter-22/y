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
import { Grid } from '@mui/material';

function Prefix(props) {
    return (
        <div style={{ width: "30px", display: "flex", justifyContent: "end", padding: "0px 10px" }}>
            {props.children}
        </div>
    )
}

function RowWithPrefix(props) {
    return (
        <Stack direction="row">
            <Prefix>{props.prefix}</Prefix>
            {props.contents}
        </Stack>
    );
}

function Post(props) {
    return (
        <ListItem disablePadding sx={{ borderBottom: 1, borderColor: "divider" }}>
            <ListItemButton>
                <Stack direction="column" style={{ overflow: "hidden" }}>
                    <RowWithPrefix
                        prefix={<Icon color="secondary" style={{ fontSize: "15px" }}>loop</Icon>}
                        contents={<FadeLink>adsgsgdsdggsd reposted</FadeLink>} />
                    <RowWithPrefix
                        prefix={<Avatar src="/src/images/example profile.jpg" />}
                        contents={
                            <Stack direction="column" style={{ overflow: "hidden" }}>
                                <Stack direction="row" style={{ alignItems: "center" }}>
                                    <ProfileText row={true} />
                                    <IconButton size="small"><Icon fontSize="small">more_horiz</Icon></IconButton>
                                </Stack>
                                <Typography variant="small">
                                    post text dgffd dgf dfg gfddgf dgd gdg
                                </Typography>
                                <Box border={1} borderColor="divider" style={{
                                    margin: "10px 0px",
                                    overflow: "hidden",
                                    borderRadius: "10px",
                                    boxSizing: "border-box"
                                }}>
                                    <Stack direction="column" spacing="2px">
                                        <Stack direction="row" spacing="2px">
                                            <BlockImage />
                                            <BlockImage />
                                        </Stack>
                                        <Stack direction="row" spacing="2px">
                                            <BlockImage />
                                            <BlockImage />
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Stack>
                        } />
                    <RowWithPrefix contents={
                        <Stack direction="row" justifyContent="space-between" style={{ flexGrow: 1 }}>

                            <PostBottomIcon icon="more_horiz" text="999k" >
                                chat_bubble_outline
                            </PostBottomIcon>

                            <PostBottomIcon icon="more_horiz" text="999k" >
                                loop
                            </PostBottomIcon>

                            <PostBottomIcon icon="more_horiz" text="999k" >
                                favorite_border
                            </PostBottomIcon>

                            <PostBottomIcon icon="more_horiz" text="999k" >
                                align_vertical_bottom
                            </PostBottomIcon>

                            <Stack direction="row">
                                <IconButton size="small">
                                    <Icon fontSize="small">
                                        bookmark_border
                                    </Icon>
                                </IconButton>

                                <IconButton size="small">
                                    <Icon fontSize="small">
                                        upload
                                    </Icon>
                                </IconButton>
                            </Stack>

                        </Stack>
                    } />
                </Stack>
            </ListItemButton>
        </ListItem>
    );
}

function PostList() {
    return (
        <List sx={{ p: 0 }}>
            <Post></Post>
        </List>
    );
}

function BlockImage(props) {
    return (
        <div style={{
            aspectRatio: "1 / 1",
            overflow: "hidden"
        }}>
            <img src={"/src/images/example profile copy.jpg"} style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
            }} />
        </div>
    )
}

function PostBottomIcon(props) {
    return (
        <IconButton size="small">
            <Icon fontSize="small">
                {props.children}
            </Icon>
            <Typography variant="small" style={{ position: "absolute", left: "90%" }}>{props.text}</Typography>
        </IconButton>);
}

export { Post, PostList };
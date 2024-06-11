import React, { useState, useRef, useEffect, forwardRef, createContext, useContext } from "react";
import Stack from '@mui/material/Stack';
import SideMenu, { Inside } from "./side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box, Hidden } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, OnlineList, SimplePopOver, formatNumber, UserLink, ReplyingFrom, ToggleFollow, ToggleBlock, InheritLink } from '/src/components/utilities';
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
import { NavLink, useNavigate } from "react-router-dom";
import {commentSections} from "/src/components/posts";



function ManageContent(props) {
    const { handleOpen, ShowPopover } = SimplePopOver();

    function PostOptions() {
        return (
            <ShowPopover>
                <List sx={{ p: 0 }}>
                    <Typography variant="medium_bold" sx={{ maxWidth: "70vw" }} style={noOverflow}>
                        {props.children}
                    </Typography>
                </List>
            </ShowPopover>
        );
    }

    function Clicked(e) {
        e.stopPropagation();
        handleOpen(e);
    }

    return (
        <>
            <IconButton size="small" style={{ marginLeft: "auto" }} onClick={Clicked}>
                <Icon fontSize="small">more_horiz</Icon>
            </IconButton>
            <PostOptions />
        </>
    );
}

function EngagementsRow(props) {
    const post = props.post;
    return (
        <InheritLink to={"/posts/" + post.id + "/likes"}>
            <Row>
                <Icon>align_vertical_bottom</Icon>
                <span>View post engagements</span>
            </Row>
        </InheritLink>
    );
}

function FollowRow(props) {
    const user = props.user;
    const [follow, setFollow, toggleFollow] = ToggleFollow(user);

    return (
        <Row onClick={toggleFollow}>
            {follow ?
                <><Icon>person_remove</Icon><span>Unfollow</span></>
                :
                <><Icon>person_add_alt_1</Icon><span>Follow</span></>
            }
            <span>< GetUserKey user={user} /></span>
        </Row>
    );
}

function BlockRow(props) {
    const user = props.user;
    const [blocked, setBlock, toggleBlock] = ToggleBlock(user,props.onChange);

    return (
        <Row onClick={toggleBlock}>
            {blocked ?
                <><Icon>do_disturb_on</Icon><span>Unblock</span></>
                :
                <><Icon>do_disturb</Icon><span>Block</span></>
            }
            <span>< GetUserKey user={user} /></span>
        </Row>
    );
}

function Row(props) {
    return (
        <ListItem disablePadding>
            <ListItemButton onClick={props.onClick}>
                <TextRow>
                    {props.children}
                </TextRow>
            </ListItemButton>
        </ListItem>
    );
}


function ManagePost(props) {
    const post = props.post;
    const user = post.publisher;
    const is_me = post.publisher.id === UserData.getData.user.id;
    function onBlock()
    {
        commentSections.active.update();
    }

    return (
        <ManageContent>
            {!is_me &&
                <>
                    <FollowRow user={user} />
                    <BlockRow user={user} onChange={onBlock}/>
                </>
            }
            <EngagementsRow post={post} />
        </ManageContent>
    );
}

function ManageProfile(props) {
    const user = props.user;

    return (
        <ManageContent>
            <FollowRow user={user} />
            <BlockRow user={user} onChange={props.onBlock}/>
        </ManageContent>
    );
}

export default ManageContent;
export { ManagePost, ManageProfile };

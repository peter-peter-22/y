import React, { useState, useRef, useEffect, forwardRef, createContext, useContext } from "react";
import Stack from '@mui/material/Stack';
import { Inside } from "./side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box, Hidden } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, OnlineList, SimplePopOver, formatNumber, UserLink, ReplyingFrom, ToggleFollow, ToggleBlock, InheritLink } from '/src/components/utilities';
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
import { NavLink, useNavigate } from "react-router-dom";
import { PostModalFrame, commentSections } from "/src/components/posts";
import { PostCreator } from "/src/components/post_creator";
import { get_focused_id } from "/src/pages/post_focused.jsx";

let closeCurrent = undefined;
function close() {
    if (closeCurrent)
        closeCurrent();
}

function ManageContent(props) {
    const { handleOpen, handleClose, ShowPopover } = SimplePopOver();

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
        closeCurrent = handleClose;
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
        <InheritLink to={engagementsLink(post)}>
            <Row>
                <Icon>align_vertical_bottom</Icon>
                <span>View post engagements</span>
            </Row>
        </InheritLink>
    );
}

function engagementsLink(post)
{
    return "/posts/" + post.id + "/likes";
}

function FollowRow(props) {
    const user = props.user;
    const [follow, setFollow, toggleFollow] = ToggleFollow(user);

    return (
        <Row onClick={toggleFollow}>
            <Icon>{follow ? "person_remove" : "person_add_alt_1"}</Icon>
            <span>{follow ? "Unfollow" : "Follow"} < GetUserKey user={user} /></span>
        </Row>
    );
}

function BlockRow(props) {
    const user = props.user;
    const [blocked, setBlock, toggleBlock] = ToggleBlock(user, update);

    function handleBlock() {
        close();
        toggleBlock();
    }

    return (
        <Row onClick={handleBlock}>
            <Icon>{blocked ? "do_disturb_on" : "do_disturb"}</Icon>
            <span>{blocked ? "Unblock" : "Block"} < GetUserKey user={user} /></span>
        </Row>
    );
}

function DeleteRow({ post }) {
    const navigate = useNavigate();
    async function handle_delete() {
        close();

        //delete from db
        await axios.post(
            "/member/delete/post",
            { id: post.id }
        );

        //display the update
        if (get_focused_id() == post.id) {
            //if the deleted post was focused, go back to the main page
            navigate("/");
        }
        else {
            //if not, update the comment section
            update();
        }
    }

    return (
        <Row onClick={handle_delete}>
            <Icon>close</Icon>
            <span>Delete</span>
        </Row>
    );
}

function EditRow({ post }) {
    async function handle_edit() {
        close();
        Modals[0].Show(
            <PostModalFrame>
                <PostCreator onPost={onSubmit} editing={post} quoted={post.reposted_post} noUpdate/>
            </PostModalFrame>
        );
    }

    function onSubmit(edited) {
        Modals[0].Close();
        post.setPost(edited);
    }

    return (
        <Row onClick={handle_edit}>
            <Icon>edit</Icon>
            <span>Edit</span>
        </Row>
    );
}


function Row(props) {
    return (
        <ListItem disablePadding>
            <ListItemButton onClick={props.onClick}>
                <Stack direction="row" spacing={1}>
                    {props.children}
                </Stack>
            </ListItemButton>
        </ListItem>
    );
}

function update() {
    commentSections.active.update();
}

function ManagePost({ original, overriden }) {
    const user = overriden.publisher;
    const is_me = original.publisher.id === UserData.getData.user.id;

    return (
        <ManageContent>
            {is_me ?
                <>
                    <DeleteRow post={original} />
                    {!original.repost && <EditRow post={original} />}
                </>
                :
                <>
                    <FollowRow user={user} />
                    <BlockRow user={user} />
                </>
            }
            <EngagementsRow post={overriden} />
        </ManageContent>
    );
}

function ManageProfile(props) {
    const user = props.user;

    return (
        <ManageContent>
            <FollowRow user={user} />
            <BlockRow user={user} onChange={props.onBlock} />
        </ManageContent>
    );
}

export default ManageContent;
export { ManagePost, ManageProfile,engagementsLink };

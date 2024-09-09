import { Icon, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { useCallback, useContext, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Modals } from "/src/components/modals";
import { PostCreator } from "/src/components/post_creator";
import { get_focused_id } from "/src/components/post_focused_components";
import { PostModalFrame, UsePostList } from "/src/components/posts";
import { UserContext } from "/src/components/user_data";
import { GetUserKey, InheritLink, SimplePopOver, ToggleBlock, ToggleFollow, noOverflow } from '/src/components/utilities';
import { Sus } from "/src/components/lazified";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const AlignVerticalBottomIcon = lazy(() => import('@mui/icons-material/AlignVerticalBottom'));
const PersonRemoveIcon = lazy(() => import('@mui/icons-material/PersonRemove'));
const PersonAddAlt1Icon = lazy(() => import('@mui/icons-material/PersonAddAlt1'));
const DoDisturbOnIcon = lazy(() => import('@mui/icons-material/DoDisturbOn'));
const DoDisturbIcon = lazy(() => import('@mui/icons-material/DoDisturb'));
const CloseIcon = lazy(() => import('@mui/icons-material/Close'));
const EditIcon = lazy(() => import('@mui/icons-material/Edit'));

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
                <Sus>
                    <List sx={{ p: 0 }}>
                        <Typography variant="medium_bold" sx={{ maxWidth: "70vw" }} style={noOverflow}>
                            {props.children}
                        </Typography>
                    </List>
                </Sus>
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
                <MoreHorizIcon fontSize="small" />
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
                <AlignVerticalBottomIcon />
                <span>View post engagements</span>
            </Row>
        </InheritLink>
    );
}

function engagementsLink(post) {
    return "/posts/" + post.id + "/likes";
}

function FollowRow(props) {
    const user = props.user;
    const [follow, setFollow, toggleFollow] = ToggleFollow(user);

    return (
        <Row onClick={toggleFollow}>
            {follow ? <PersonRemoveIcon /> : <PersonAddAlt1Icon />}
            <span>{follow ? "Unfollow" : "Follow"} < GetUserKey user={user} /></span>
        </Row>
    );
}

function BlockRow({ user, onChange }) {
    const [blocked, setBlock, toggleBlock] = ToggleBlock(user, onChange);

    function handleBlock() {
        close();
        toggleBlock();
    }

    return (
        <Row onClick={handleBlock}>
            {blocked ? <DoDisturbOnIcon /> : <DoDisturbIcon />}
            <span>{blocked ? "Unblock" : "Block"} < GetUserKey user={user} /></span>
        </Row>
    );
}

function DeleteRow({ post }) {
    const navigate = useNavigate();
    const postList = UsePostList();
    async function handle_delete() {
        close();

        //delete from db
        await axios.post(
            "member/delete/post",
            { id: post.id }
        );

        //display the update
        if (get_focused_id() == post.id) {
            //if the deleted post was focused, go back to the main page
            navigate("/");
        }
        else {
            //if not, update the comment section
            postList.mapRows((row) => {
                if (row.id === post.id) {
                    row.deleted = true;
                    return { ...row };//this will update the post even if it is currently visible
                }
                return row;
            });
        }
    }

    return (
        <Row onClick={handle_delete}>
            <CloseIcon />
            <span>Delete</span>
        </Row>
    );
}

function EditRow({ post }) {
    const postList = UsePostList();
    async function handle_edit() {
        close();
        Modals[0].Show(
            <PostModalFrame>
                <PostCreator onPost={onSubmit} editing={post} quoted={post.reposted_post} />
            </PostModalFrame>
        );
    }

    function onSubmit(edited) {
        Modals[0].Close();
        postList.mapRows((row) => {
            if (row.id === edited.id) {
                return edited;//this will update the post even if it is currently visible
            }
            return row;
        });
    }

    return (
        <Row onClick={handle_edit}>
            <EditIcon />
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

function ManagePost({ original, overriden }) {
    const postList = UsePostList();
    const { getData } = useContext(UserContext);
    const user = overriden.publisher;
    const is_me = original.publisher.id === getData.user.id;

    const onChange = useCallback((isBlocked, user) => {
        postList.mapRows((row) => {
            if (row.publisher.id === user.id) {
                row.publisher.is_blocked = isBlocked;
                return { ...row };//this will update the post even if it is currently visible
            }
            return row;
        });
    });

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
                    <BlockRow user={user} onChange={onChange} />
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

export { ManagePost, ManageProfile, engagementsLink };


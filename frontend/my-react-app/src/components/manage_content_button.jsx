import { Icon, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Modals } from "/src/components/modals";
import { PostCreator } from "/src/components/post_creator";
import { PostModalFrame, commentSections } from "/src/components/posts";
import { UserContext } from "/src/components/user_data";
import { GetUserKey, InheritLink, SimplePopOver, ToggleBlock, ToggleFollow, noOverflow } from '/src/components/utilities';
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

function engagementsLink(post) {
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

function BlockRow({ user, onChange }) {
    const [blocked, setBlock, toggleBlock] = ToggleBlock(user, onChange);

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
            commentSections.active.mapRows((row) => {
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
                <PostCreator onPost={onSubmit} editing={post} quoted={post.reposted_post} />
            </PostModalFrame>
        );
    }

    function onSubmit(edited) {
        Modals[0].Close();
        commentSections.active.mapRows((row) => {
            if (row.id === edited.id) {
                return edited;//this will update the post even if it is currently visible
            }
            return row;
        });
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

function ManagePost({ original, overriden }) {
    const { getData } = useContext(UserContext);
    const user = overriden.publisher;
    const is_me = original.publisher.id === getData.user.id;

    const onChange = useCallback((isBlocked, user) => {
        commentSections.active.mapRows((row) => {
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

export default ManageContent;
export { ManagePost, ManageProfile, engagementsLink };


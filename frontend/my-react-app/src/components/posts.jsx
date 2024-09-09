import { Box, SvgIcon, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { memo, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BlueCenterButton } from "/src/components/buttons";
import config from '/src/components/config';
import { ExamplePost } from "/src/components/exampleData.js";
import { Sus } from "/src/components/lazified";
import { ManagePost, engagementsLink } from "/src/components/manage_content_button.jsx";
import { Modals, SuccessModal } from "/src/components/modals";
import OnlineList from "/src/components/online_list";
import { OpenOnClick, PostModalFrame, SetPostList } from "/src/components/post_components";
import { PostMedia } from "/src/components/post_media";
import { TextDisplayer } from '/src/components/post_text';
import { FadeLink, GetUserName, ProfileText, ReplyingFrom, SimplePopOver, TextRow, UserKey, UserLink, formatNumber, noOverflow } from '/src/components/utilities';
import {
    DateLink,
    GetPostMedia,
    ProfilePic
} from "/src/components/utilities_auth";

import PostCreator from '/src/components/post_creator';

import AlignVerticalBottomIcon from '@mui/icons-material/AlignVerticalBottom';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LoopIcon from "@mui/icons-material/Loop";
import UploadIcon from "@mui/icons-material/Upload";

function Prefix(props) {
    return (
        <div style={{ display: "flex", justifyContent: "end", padding: "0px 10px", flexShrink: 0, width: 60 }}>
            {props.children}
        </div>
    )
}

function RowWithPrefix(props) {
    return (
        <Stack direction="row">
            <Prefix>{props.prefix}</Prefix>
            <div style={{ flexGrow: 1, overflow: "hidden" }}>
                {props.contents}
            </div>
        </Stack>
    );
}

function Post({ post }) {
    return (
        <ListBlockButton>
            <BorderlessPost post={post} />
        </ListBlockButton>
    );
}

function BorderlessPost({ post, hideButtons }) {
    const original = post;
    const overriden = OverrideWithRepost(original);

    return (<OpenPostOnClick id={original.id}>
        <RepostedOrQuoted post={original} />
        <RowWithPrefix
            prefix={<ProfilePic user={overriden.publisher} />}
            contents={
                <Stack direction="column" spacing={1} sx={{ mb: 1, overflow: "hidden" }}>

                    <Stack direction="row" spacing={0.25} style={{ alignItems: "center" }}>
                        <UserLink user={overriden.publisher} />
                        <UserKey user={overriden.publisher} />
                        ·
                        <DateLink passed isoString={overriden.date} />
                        <ManagePost original={original} overriden={overriden} />
                    </Stack>
                    <ReplyingToPost post={overriden} />
                    <TextDisplayer text={overriden.text} />
                    <PostMedia medias={overriden.mediaObjects} />
                </Stack>
            } />

        <RowWithPrefix
            contents={
                <Stack direction="column" spacing={1} style={{ overflow: "hidden" }}>
                    {overriden.quote &&
                        <Box sx={{ pt: 1 }}>
                            <QuotedFrame>
                                <BorderlessPost post={overriden.reposted_post} hideButtons={true} />
                            </QuotedFrame>
                        </Box>
                    }
                    {!hideButtons &&
                        <PostButtonRow post={overriden} />
                    }
                </Stack>
            } />
    </OpenPostOnClick>
    );
}

function BlockedComment({ show }) {
    return (
        <ListBlockButton>
            <Typography variant="small_fade" style={{ textAlign: "center", width: "100%" }}>
                This content belongs to a user you blocked.
            </Typography>

            <BlueCenterButton onClick={show}>
                Show
            </BlueCenterButton>
        </ListBlockButton>
    );
}

function getPostLink(id) {
    return "/posts/" + id;
}

function OpenPostOnClick({ id, children }) {
    const link = getPostLink(id);
    return (
        <OpenOnClick link={link}>
            {children}
        </OpenOnClick>
    )
}

function ReplyingToPost({ post }) {
    if (post.replied_user) {
        return (<ReplyingFrom post={post} />);
    }
}

function PostFocused(props) {
    const original = props.post;
    const overriden = OverrideWithRepost(original);

    return (
        <ListBlock>
            <RepostedOrQuoted post={original} />
            <RowWithPrefix
                prefix={<ProfilePic user={overriden.publisher} />}
                contents={
                    <Stack direction="column" style={{ overflow: "hidden" }}>
                        <Stack direction="row" spacing={0.25} style={{ alignItems: "center" }}>
                            <ProfileText user={overriden.publisher} link />
                            <ManagePost original={original} overriden={overriden} />
                        </Stack>
                        <ReplyingToPost post={overriden} />
                    </Stack>
                } />

            <Stack direction="column" sx={{ overflow: "hidden", mt: 1 }}>
                <TextDisplayer text={overriden.text} />
                <PostMedia medias={overriden.mediaObjects} />
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "baseline", my: 1 }}>
                    <DateLink passed isoString={overriden.date} />
                    <Typography variant="small_fade">·</Typography>
                    <Typography variant="small_bold">{formatNumber(overriden.view_count)}</Typography>
                    <Typography variant="small_fade">Views</Typography>
                </Stack>
            </Stack>

            {overriden.quote &&
                <Box sx={{ my: 1 }}>
                    <QuotedFrame>
                        <BorderlessPost post={overriden.reposted_post} />
                    </QuotedFrame>
                </Box>
            }

            <Divider />

            <Box sx={{ my: 1 }}>
                <PostButtonRow post={overriden} />
            </Box>

            <Divider />

            <PostCreator post={overriden} />
        </ListBlock>
    );
}

function WritePost() {
    return (
        <ListBlock>
            <PostCreator />
        </ListBlock>
    );
}

function PostButtonRow(props) {
    let post = props.post;
    if (post === undefined)
        post = ExamplePost();

    const { count: like_count, active: liked, pressed: handleLike } = CountableButton(post, "like_count", "liked_by_user", "/member/general/like");
    const { count: bookmark_count, active: bookmarked, pressed: handleBookmark } = CountableButton(post, "bookmark_count", "bookmarked_by_user", "/member/general/bookmark");
    const { count: repost_count, active: reposted, pressed: handleRepost } = CountableButton(post, "repost_count", "reposted_by_user", "/member/general/repost");
    const [comment_count, set_comment_count] = useState(post.comment_count);
    const navigate = useNavigate();

    function handleComment() {
        Modals[0].Show(
            <PostModalFrame>
                <Sus><PostCreator post={post} onPost={commented} /></Sus>
            </PostModalFrame>
        );
    }

    function commented() {
        set_comment_count((prev) => prev + 1);
        closeModal();
    }

    function handleQuote() {
        Modals[0].Show(
            <PostModalFrame>
                <Sus><PostCreator quoted={post} onPost={closeModal} /></Sus>
            </PostModalFrame>
        );
    }

    function handleViewClick() {
        navigate(engagementsLink(post));
    }

    function closeModal() {
        Modals[0].Close();
    }

    function handleLink() {
        navigator.clipboard.writeText(config.address_mode.client + getPostLink(post.id));
        Modals[0].Show(<SuccessModal text="Link copied" />);
    }

    const { handleOpen: showRepostDialog, handleClose: handleCloseRepost, ShowPopover: RepostPopover } = SimplePopOver();
    const { handleOpen: showShareDialog, handleClose: handleCloseShare, ShowPopover: SharePopover } = SimplePopOver();

    return (
        <Stack direction="row" justifyContent="space-between" style={{ flexGrow: 1 }}>

            <PostBottomIcon text={formatNumber(comment_count)}
                active_icon={<ChatBubbleOutlineIcon />}
                inactive_icon={<ChatBubbleOutlineIcon />}
                active_color="primary.main"
                onClick={handleComment} />

            <PostBottomIcon text={formatNumber(repost_count)}
                active_icon={<LoopIcon />}
                inactive_icon={<LoopIcon />}
                active_color="colors.share"
                active={reposted}
                onClick={showRepostDialog} />

            <PostBottomIcon text={formatNumber(like_count)}
                active_icon={<FavoriteIcon />}
                inactive_icon={<FavoriteBorderIcon />}
                active_color="colors.like"
                active={liked}
                onClick={handleLike} />

            <PostBottomIcon text={formatNumber(post.view_count)}
                active_icon={<AlignVerticalBottomIcon />}
                inactive_icon={<AlignVerticalBottomIcon />}
                active_color="primary.main"
                onClick={handleViewClick}
            />

            <PostBottomIcon
                text={formatNumber(bookmark_count)}
                active_icon={<BookmarkIcon />}
                inactive_icon={<BookmarkBorderIcon />}
                active_color="primary.main"
                active={bookmarked}
                onClick={handleBookmark} />

            <IconButton size="small" onClick={showShareDialog}>
                <UploadIcon fontSize="small" />
            </IconButton>

            <RepostPopover>
                <ListItem disablePadding>
                    <ListItemButton onClick={(e) => { handleCloseRepost(e); handleRepost() }}>
                        <Typography variant="medium_bold">
                            {reposted ? "Undo repost" : "Repost"}
                        </Typography>
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={(e) => { handleCloseRepost(e); handleQuote() }}>
                        <Typography variant="medium_bold">
                            Quote
                        </Typography>
                    </ListItemButton>
                </ListItem>
            </RepostPopover>

            <SharePopover>
                <ListItem disablePadding>
                    <ListItemButton onClick={(e) => { handleCloseShare(e); handleLink() }}>
                        <Typography variant="medium_bold">
                            Copy link
                        </Typography>
                    </ListItemButton>
                </ListItem>
            </SharePopover>
        </Stack>
    );
}

function QuotedFrame(props) {
    return (
        <Box sx={{ borderRadius: "10px", border: 1, borderColor: "divider", overflow: "hidden", p: 1, w: "100%", transition: "background-color 0.2s", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" } }}>
            {props.children}
        </Box>
    );
}

function CountableButton(post, count_name, active_name, url) {
    const initial_active = post[active_name];
    const [like, setLike] = useState(initial_active);
    const startRef = useRef({ count: post[count_name], active: post[active_name] });
    const last_updateRef = useRef(initial_active);

    function handleLike() {
        setLike((prev) => {
            const newValue = !prev;

            async function updateServer(newValue) {
                try {
                    await axios.post(url, { key: post.id, value: newValue });
                }
                catch (err) {
                    setLike(prev);//server error, put back previous value
                }
            }

            //prevent duplicated requests
            if (last_updateRef.current !== newValue) {
                last_updateRef.current = newValue;
                updateServer(newValue);
            }

            return newValue;
        });
    }

    //calculate offset
    let like_offset = 0;
    if (like)
        like_offset += 1;
    if (startRef.current.active)
        like_offset -= 1;

    //save post
    const count = startRef.current.count + like_offset;
    post[count_name] = count;
    post[active_name] = like;

    return {
        count: count,
        active: like,
        pressed: handleLike,
    }
}

const HideablePostMemo = memo((props) => {
    return (<HideablePostAny {...props} Renderer={Post} />);
}, (prev, next) => prev.entry === next.entry);

const HideablePostFocusedMemo = memo((props) => {
    return (<HideablePostAny {...props} Renderer={PostFocused} />);
}, (prev, next) => prev.entry === next.entry);

function HideablePostAny({ entry, Renderer }) {
    const [show, setShow] = useState(false);

    if (entry.deleted)
        return;

    if (entry.publisher.is_blocked && !show)
        return (<BlockedComment show={() => { setShow(true) }} />);

    return (
        <Renderer post={entry} />
    );
}

function SimplifiedPostList({ params: additional_params, post, endpoint, id, scrollRestoration = true }) {
    const onlineListRef = useRef(null);
    async function getPosts(from, timestamp) {
        let params = { from, timestamp };
        if (additional_params)
            params = { ...params, ...additional_params };
        const response = await axios.post(endpoint, params);
        return response.data;
    }

    useEffect(() => {
        //create the object that will let other components to edit and update this comment section

        const addPost = (newPost) => { onlineListRef.current.AddEntryToTop(newPost) };
        const update = () => { onlineListRef.current.update };
        const mapRows = (fn) => { onlineListRef.current.mapRows(fn) };
        const replied_post = post;

        const thisCommentSection = { addPost, update, mapRows, replied_post };

        SetPostList(thisCommentSection);
    }, [post]);

    return (
        <OnlineList
            getEntries={getPosts}
            EntryMapper={HideablePostMemo}
            ref={onlineListRef}
            key={id}
            id={id}
            getKey={(entry, index) => entry?.id ?? "loading"}
            exampleSize={100}
            scrollRestoration={scrollRestoration}
        />
    );
}

function PostBottomIcon(props) {
    return (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); if (props.onClick) props.onClick(e); }}>
            <SvgIcon sx={{ color: props.active ? props.active_color : "" }} fontSize="small">
                {props.active ? props.active_icon : props.inactive_icon}
            </SvgIcon>
            <Typography variant="small" color="secondary" style={{ position: "absolute", left: "90%" }}>{props.text}</Typography>
        </IconButton>);
}

function RepostedOrQuoted(props) {
    const post = props.post;
    if (post.repost || post.quote) {
        return (
            <RowWithPrefix
                prefix={<LoopIcon color="secondary" style={{ fontSize: "15px", alignSelf: "center" }} />}
                contents={
                    <FadeLink to={"/posts/" + post.reposted_post.id} style={{ fontWeight: "bold", overflow: "hidden" }}>
                        <TextRow>
                            <span color="secondary.main" style={noOverflow}>
                                <GetUserName user={post.publisher} />
                            </span>
                            <span>{post.repost ? "reposted" : "quoted"}</span>
                        </TextRow>
                    </FadeLink>
                } />//clicking leads to the source post
        );
    }
}

function ListBlock(props) {
    return (
        <ListItem sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="column" style={{ overflow: "hidden", width: "100%" }}>
                {props.children}
            </Stack>
        </ListItem>
    );
}

function ListBlockButton(props) {
    return (
        <ListItem disablePadding sx={{ borderBottom: 1, borderColor: "divider" }} {...props}>
            <ListItemButton>
                <Stack direction="column" style={{ overflow: "hidden", width: "100%" }}>
                    {props.children}
                </Stack>
            </ListItemButton>
        </ListItem>
    );
}

function AddDataToPost(post) {
    if (post.reposted_post) {
        const is_quote = post.text !== null;
        post.repost = !is_quote;
        post.quote = is_quote;

        AddDataToPost(post.reposted_post);
    }

    post.mediaObjects = GetPostMedia(post);
}

//if this is a repost, the data of the reposted post will be displayed instead of the original post
function OverrideWithRepost(post) {
    AddDataToPost(post);

    if (post.repost) {
        return post.reposted_post;
    }
    return post;
}


export { BorderlessPost, HideablePostFocusedMemo, HideablePostMemo, ListBlock, ListBlockButton, OpenPostOnClick, OverrideWithRepost, Post, QuotedFrame, RowWithPrefix, SimplifiedPostList, WritePost };


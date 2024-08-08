import { Box, Icon, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { memo, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThrowIfNotAxios } from "/src/communication.js";
import { ExamplePost } from "/src/components/exampleData.js";
import { ManagePost, engagementsLink } from "/src/components/manage_content_button.jsx";
import { Modals,SuccessModal } from "/src/components/modals";
import { PostCreator, findAndColorHashtags } from "/src/components/post_creator.jsx";
import { PostMedia } from "/src/components/post_media";
import { DateLink, FadeLink, GetPostMedia, GetUserName, OnlineList, ProfilePic, ProfileText, ReplyingFrom, SimplePopOver, TextRow, UserKey, UserLink, formatNumber, noOverflow } from '/src/components/utilities';
import config from './config';

const postLists = {};
const commentSections = {};

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
                    <PostText post={overriden} />
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

function BlockedComment(props) {
    const unHide = props.unHide;

    return (
        <ListBlockButton>
            <Typography variant="small_fade" style={{ textAlign: "center", width: "100%" }}>
                This comment belongs to a user you blocked.
            </Typography>

            <BlueCenterButton onClick={unHide}>
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

function OpenOnClick(props) {
    const navigate = useNavigate();
    function Clicked(e) {
        e.stopPropagation();
        navigate(props.link);
    }
    return (
        <div onClick={Clicked} {...props}>
            {props.children}
        </div>
    );
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
                <PostText post={overriden} />
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
                <PostCreator post={post} onPost={commented} />
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
                <PostCreator quoted={post} onPost={closeModal} />
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
        navigator.clipboard.writeText(config.address_mode.client+getPostLink(post.id));
        Modals[0].Show(<SuccessModal text="Link copied"/>);
    }

    const { handleOpen: showRepostDialog,handleClose:handleCloseRepost, ShowPopover: RepostPopover } = SimplePopOver();
    const { handleOpen: showShareDialog,handleClose:handleCloseShare, ShowPopover: SharePopover } = SimplePopOver();

    return (
        <Stack direction="row" justifyContent="space-between" style={{ flexGrow: 1 }}>

            <PostBottomIcon text={formatNumber(comment_count)}
                active_icon="chat_bubble_outline"
                inactive_icon="chat_bubble_outline"
                active_color="primary.main"
                onClick={handleComment} />

            <PostBottomIcon text={formatNumber(repost_count)}
                active_icon="loop"
                inactive_icon="loop"
                active_color="colors.share"
                active={reposted}
                onClick={showRepostDialog} />

            <PostBottomIcon text={formatNumber(like_count)}
                active_icon="favorite"
                inactive_icon="favorite_border"
                active_color="colors.like"
                active={liked}
                onClick={handleLike} />

            <PostBottomIcon text={formatNumber(post.view_count)}
                active_icon="align_vertical_bottom"
                inactive_icon="align_vertical_bottom"
                active_color="primary.main"
                onClick={handleViewClick}
            />

            <PostBottomIcon
                text={formatNumber(bookmark_count)}
                active_icon="bookmark"
                inactive_icon="bookmark_border"
                active_color="primary.main"
                active={bookmarked}
                onClick={handleBookmark} />

            <IconButton size="small" onClick={showShareDialog}>
                <Icon fontSize="small">
                    upload
                </Icon>
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

function PostModalFrame(props) {
    return (
        <div style={{ width: "500px", padding: "20px", maxWidth: "100%", boxSizing: "border-box" }}>
            {props.children}
        </div>
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
    const [post, setPost] = useState(props.entry);
    post.setPost = setPost;
    const [hidden, setHidden] = useState(post.publisher.is_blocked)
    if (!hidden)
        return (<Post post={post} />);
    else if (post.replying_to !== null)//comments are visible in an alternative way if the user is blocked
        return (<BlockedComment unHide={() => { setHidden(false) }} />);
});

function PostList({ post, getPosts, id }) {
    const onlineListRef = useRef();
    const [key, setKey] = useState(post ? post.id : -1);

    async function GetEntries(from, timestamp) {
        try {
            const new_posts = await getPosts(from, timestamp);
            return new_posts;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    useEffect(() => {
        //create the object that will let other components to edit and update this comment section
        const thisCommentSection = {};
        thisCommentSection.addPost = (newPost) => { onlineListRef.current.AddEntryToTop(newPost) };
        thisCommentSection.update = () => { setKey((prev) => prev + 1) };//update the list after block
        thisCommentSection.post = post ? post.id : null;//what post belongs to this comment section? null if this is the main feed
        commentSections.active = thisCommentSection;
    }, []);

    return (
        <OnlineList
            getEntries={GetEntries}
            EntryMapper={HideablePostMemo}
            ref={onlineListRef}
            key={key}
            entryMapController={postEntryMapController}
            startingEntries={postLists[id]}
            onDismounth={(entries) => {
                postLists[id] = entries
            }}
            deDuplicate={
                (results, entries) => {
                    return results.filter((result) => entries.findIndex((entry) => entry.id === result.id) === -1);
                }
            }
        />
    );
}

function postEntryMapController({ entries, EntryMapper }) {
    return (
        <List sx={{ p: 0 }} >
            {entries.map((entry, index) => <EntryMapper key={entry.id} index={index} entry={entry} />)}
        </List>
    );
}

function SimplifiedPostList({ params: additional_params, post, endpoint }) {
    async function getPosts(from, timestamp) {
        let params = { from, timestamp };
        if (additional_params)
            params = { ...params, ...additional_params };
        const response = await axios.post(endpoint, params);
        return response.data;
    }
    return <PostList getPosts={getPosts} post={post} id={endpoint} />;
}

function PostBottomIcon(props) {
    return (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); if (props.onClick) props.onClick(e); }}>
            <Icon sx={{ color: props.active ? props.active_color : "" }} fontSize="small" baseClassName={props.active ? "material-icons" : "material-icons-outlined"}>
                {props.active ? props.active_icon : props.inactive_icon}
            </Icon>
            <Typography variant="small" color="secondary" style={{ position: "absolute", left: "90%" }}>{props.text}</Typography>
        </IconButton>);
}

function PostText(props) {
    return (
        <Typography variant="small" style={{ wordWrap: "break-word" }} dangerouslySetInnerHTML={{ __html: findAndColorHashtags(props.post.text) }} />
    );
}

function RepostedOrQuoted(props) {
    const post = props.post;
    if (post.repost || post.quote) {
        return (
            <RowWithPrefix
                prefix={<Icon color="secondary" style={{ fontSize: "15px", alignSelf: "center" }}>loop</Icon>}
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


export { BorderlessPost, ListBlock, ListBlockButton, OpenOnClick, OpenPostOnClick, OverrideWithRepost, Post, PostButtonRow, PostFocused, PostList, PostModalFrame, QuotedFrame, RowWithPrefix, SimplifiedPostList, WritePost, commentSections };

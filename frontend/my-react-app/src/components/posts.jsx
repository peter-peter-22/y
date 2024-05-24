import React, { useState, useRef, useEffect, forwardRef } from "react";
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
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, default_image, GetPostPictures, OnlineList, SimplePopOver, formatNumber } from '/src/components/utilities';
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
import { useNavigate } from "react-router-dom";

const commentSections = {};

function Prefix(props) {
    return (
        <div style={{ width: "30px", display: "flex", justifyContent: "end", padding: "0px 10px", flexShrink: 0 }}>
            {props.children}
        </div>
    )
}

function RowWithPrefix(props) {
    return (
        <Stack direction="row">
            <Prefix>{props.prefix}</Prefix>
            <div style={{ flexGrow: 1 }}>
                {props.contents}
            </div>
        </Stack>
    );
}

function Post(props) {
    return (
        <ListBlockButton>
            <BorderlessPost post={props.post} />
        </ListBlockButton>
    );
}

function BorderlessPost(props) {
    const original = props.post;
    const overriden = OverrideWithRepost(original);
    const navigate = useNavigate();

    function OpenPost(e) {
        e.stopPropagation();
        const link = "/posts/" + original.id;
        navigate(link);
    }

    return (
        <div onClick={OpenPost}>
            <RepostedOrQuoted post={original} />
            <RowWithPrefix
                prefix={<Avatar src={GetProfilePicture(overriden)} />}
                contents={
                    <Stack direction="column" style={{ overflow: "hidden" }}>
                        <Stack direction="row" spacing={0.25} style={{ alignItems: "center" }}>
                            <UserName user={overriden.publisher} />
                            <UserKey user={overriden.publisher} />
                            ·
                            <DateLink passed isoString={overriden.date} />
                            <ManagePost />
                        </Stack>
                        <PostText post={overriden} />
                        <PostMedia images={overriden.images} />
                    </Stack>
                } />
            <RowWithPrefix contents={
                <Stack direction="column" spacing={1} style={{ overflow: "hidden" }}>
                    {overriden.quote &&
                        <Box sx={{ pt: 1 }}>
                            <QuotedFrame>
                                <BorderlessPost post={overriden.reposted_post} hideButtons={true} />
                            </QuotedFrame>
                        </Box>
                    }
                    {!props.hideButtons &&
                        <PostButtonRow post={overriden} />
                    }
                </Stack>
            } />
        </div>
    );
}


function PostFocused(props) {
    const original = props.post;
    const overriden = OverrideWithRepost(original);

    return (
        <ListBlock>
            <RepostedOrQuoted post={original} />
            <RowWithPrefix
                prefix={<Avatar src={GetProfilePicture(overriden.publisher)} />}
                contents={
                    <Stack direction="column" style={{ overflow: "hidden" }}>
                        <Stack direction="row" spacing={0.25} style={{ alignItems: "center" }}>
                            <ProfileText user={overriden.publisher} />
                            <Fab variant="extended" size="small" color="black" style={{ flexShrink: 0 }}>Subscribe</Fab>
                            <ManagePost />
                        </Stack>
                    </Stack>
                } />

            <Stack direction="column" sx={{ overflow: "hidden", mt: 1 }}>
                <PostText post={overriden} />
                <PostMedia images={overriden.images} />
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "baseline", my: 1 }}>
                    <DateLink passed isoString={overriden.date} />
                    <Typography variant="small_fade">·</Typography>
                    <Typography variant="small_bold">{formatNumber(overriden.views)}</Typography>
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
                <PostButtonRow post={overriden} key={overriden.id} />
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

function PostCreator(props) {
    const [isFocused, setIsFocused] = React.useState(false);
    const [getText, setText] = React.useState("");
    const maxLetters = 280;
    const keep = getText.substring(0, maxLetters);
    const overflow = getText.substring(maxLetters);
    const isComment = props.post !== undefined;
    const isQuote = props.quoted !== undefined;
    const onPost = props.onPost;

    const handleFocus = () => {
        setIsFocused(true);
    };

    function handleChange(e) {
        setText(e.target.value);
    }

    const [files, setFiles] = useState([]);
    const [urls, setUrls] = useState([]);
    const inputRef = useRef(null);

    function handleFile(e) {
        const selected = e.target.files;
        if (selected !== undefined) {
            setFiles((prev) => [...prev, ...selected]);
            for (let n = 0; n < selected.length; n++) {
                const selectedUrl = URL.createObjectURL(selected[n]);
                setUrls((prev) => [...prev, selectedUrl]);
            }
        }
    }

    function insertPhoto() {
        inputRef.current.click();
    }

    async function submitPost() {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        formData.append('text', getText);

        let endpoint;
        if (isComment) {
            formData.append("replying_to", props.post.id);
            endpoint = "/member/create/comment";
        }
        else if (isQuote) {
            formData.append("quoted", props.quoted.id);
            endpoint = "/member/create/quote";
        }
        else {
            endpoint = "/member/create/post";
        }

        try {
            const result = await axios.post(
                Endpoint(endpoint),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setFiles([]);
            setUrls([]);
            setText("");

            //update post list on client without refreshing the page
            const post = result.data;
            AddDataToPost(post);
            AddPostToCommentSection(post);
            if (onPost)
                onPost();
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    return (
        <Stack direction="column" spacing={1}>
            {isComment && isFocused &&
                <Box sx={{ my: 1 }} >
                    <RowWithPrefix contents={
                        <ReplyingTo user={props.post.publisher} />
                    } />
                </Box>
            }
            <RowWithPrefix
                prefix={
                    <Avatar sx={{ my: 1 }} src={GetProfilePicture(UserData.getData.user)} />
                }
                contents={
                    <Stack direction="column">
                        <Stack direction={isFocused ? "column" : "row"}>
                            <Box sx={{ pb: 1, pt: 2, display: "inline-flex", flexGrow: 1, position: "relative" }}>

                                <Typography variant="body1"
                                    style={{
                                        position: "absolute",
                                        height: "100%",
                                        width: "100%",
                                        overflow: "hidden",
                                        whiteSpace: "pre",
                                        lineHeight: "1.4375em",
                                        overflowWrap: "break-word",
                                        textWrap: "wrap",
                                        color: "transparent"
                                    }}
                                >
                                    {keep}
                                    <mark style={{ background: "#FF000044" }}>{overflow}</mark>
                                </Typography>

                                <PlainTextField
                                    placeholder={props.isComment ? "Post your reply" : "Write something"}
                                    multiline
                                    fullWidth
                                    onFocus={handleFocus}
                                    onChange={handleChange}
                                    value={getText}
                                />

                            </Box>

                            <Stack direction="row" alignItems="center" >
                                {isFocused &&
                                    <Stack direction="row" alignItems="center" justifyContent={"space-between"} style={{ flexGrow: 1 }}>
                                        <Stack direction="row" spacing={0.5}>
                                            <input ref={inputRef} type="file" accept={config.accepted_image_types} onChange={handleFile} multiple style={{ display: "none" }} />
                                            <CommentButton onClick={insertPhoto}>insert_photo</CommentButton>
                                            <CommentButton>gif_box</CommentButton>
                                            <CommentButton>sentiment_satisfied_alt</CommentButton>
                                            <CommentButton>location_on</CommentButton>
                                        </Stack>

                                        <LetterCounter maxvalue={maxLetters} letters={getText.length} />
                                    </Stack>
                                }
                                <Fab disabled={getText.length === 0 || getText.length > maxLetters} variant="extended" size="small" color="primary" onClick={submitPost}>{isComment ? "Reply" : "Post"}</Fab>
                            </Stack>

                        </Stack>
                        <PostMedia images={urls} />
                    </Stack>
                } />

            {isQuote &&
                <QuotedFrame>
                    <BorderlessPost post={props.quoted} />
                </QuotedFrame>
            }

        </Stack>
    );
}

function AddPostToCommentSection(post) {
    const mySection = commentSections.acctive;
    if (mySection)
        mySection.addPost(post);
}


function PostButtonRow(props) {
    const post = props.post;
    const { count: like_count, active: liked, pressed: handleLike } = CountableButton(post, post.like_count, post.liked_by_user, "/member/like");
    const { count: bookmark_count, active: bookmarked, pressed: handleBookmark } = CountableButton(post, post.bookmark_count, post.bookmarked_by_user, "/member/bookmark");
    const { count: repost_count, active: reposted, pressed: handleRepost } = CountableButton(post, post.repost_count, post.reposted_by_user, "/member/repost");
    const [comment_count, set_comment_count] = useState(post.comment_count);

    async function handleComment() {
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

    async function handleQuote() {
        Modals[0].Show(
            <PostModalFrame>
                <PostCreator quoted={post} onPost={closeModal} />
            </PostModalFrame>
        );
    }

    function closeModal() {
        Modals[0].Close();
    }

    const { handleOpen: showRepostDialog, handleClose, ShowPopover: RepostPopover } = SimplePopOver();

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

            <PostBottomIcon text={formatNumber(post.views)}
                active_icon="align_vertical_bottom"
                inactive_icon="align_vertical_bottom"
                active_color="primary.main" />

            <PostBottomIcon
                text={formatNumber(bookmark_count)}
                active_icon="bookmark"
                inactive_icon="bookmark_border"
                active_color="primary.main"
                active={bookmarked}
                onClick={handleBookmark} />

            <IconButton size="small">
                <Icon fontSize="small">
                    upload
                </Icon>
            </IconButton>

            <RepostPopover>
                <ListItem disablePadding>
                    <ListItemButton onClick={(e) => { handleClose(e); handleRepost() }}>
                        <Typography variant="medium_bold">
                            {reposted ? "Undo repost" : "Repost"}
                        </Typography>
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={(e) => { handleClose(e); handleQuote() }}>
                        <Typography variant="medium_bold">
                            Quote
                        </Typography>
                    </ListItemButton>
                </ListItem>
            </RepostPopover>
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
        <div style={{ width: "500px", margin: "20px" }}>
            {props.children}
        </div>
    );
}

function CountableButton(post, initial_count, initial_active, url) {
    const [like, setLike] = useState(initial_active);

    function handleLike() {
        setLike((prev) => {
            const newValue = !prev;

            async function updateServer(newValue) {
                try {
                    await axios.post(Endpoint(url), { key: post.id, value: newValue });
                }
                catch (err) {
                    setLike(prev);//server error, put back previous value
                }
            }
            updateServer(newValue);

            return newValue;
        });
    }


    let like_offset = 0;
    if (like)
        like_offset += 1;
    if (initial_active)
        like_offset -= 1;

    return {
        count: initial_count + like_offset,
        active: like,
        pressed: handleLike,
    }
}

function LetterCounter(props) {
    const used = Math.min(props.letters / props.maxvalue * 100, 100);
    const remaining = props.maxvalue - props.letters;
    let warning = false;
    const normalColor = theme.palette.primary.main;
    const warningColor = "yellow";
    const errorColor = "red";
    let circleColor;
    let letterColor;

    if (remaining <= -10) {
        circleColor = "transparent";
        letterColor = errorColor;
        warning = true;
    }
    else if (remaining <= 0) {
        circleColor = errorColor;
        letterColor = errorColor;
        warning = true;
    }
    else if (remaining <= 20) {
        circleColor = warningColor;
        letterColor = "inherit";
        warning = true;
    }
    else {
        circleColor = normalColor;
        letterColor = "inherit";
    }

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate"
                sx={{
                    "& .MuiCircularProgress-circle": {
                        transition: "none"
                    },
                }}
                value={used}
                style={{ margin: "0px 10px", height: "25px", width: "25px", color: circleColor }}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="caption" component="div" style={{ color: letterColor }}>
                    {warning && remaining}
                </Typography>
            </Box>
        </Box>
    );
}

function CommentButton(props) {
    return (
        <IconButton color="primary" size="small" onClick={props.onClick}>
            <Icon fontSize="small" baseClassName="material-icons-outlined">
                {props.children}
            </Icon>
        </IconButton>
    );
}

function PostList(props) {
    const onlineListRef = useRef();
    const key = props.post ? props.post.id : -1;

    async function GetEntries(from) {
        try {
            const new_posts = await props.getPosts(from);
            new_posts.forEach((post) => {
                AddDataToPost(post);
            });
            return new_posts;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    function EntryMapper(props) {
        return (<Post post={props.entry} />);
    }

    //make the comment section globally accessable
    const thisCommentSection = {};
    thisCommentSection.addPost = (newPost) => { onlineListRef.current.AddEntryToTop(newPost) };
    commentSections.acctive = thisCommentSection;

    return (
        <OnlineList getEntries={GetEntries} entryMapper={EntryMapper} ref={onlineListRef} key={key} />
    );
}

function SimplifiedPostList(props) {
    async function getPosts(from) {
        let params = { from: from };
        const additional_params = props.params;
        if (additional_params)
            params = { ...params, ...additional_params };
        const response = await axios.post(Endpoint(props.endpoint), params);
        return response.data;
    }
    return <PostList getPosts={getPosts} post={props.post} />;
}

function FeedList() {
    return <SimplifiedPostList endpoint="/member/feed/get_posts" />;
}

function PostsOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="/member/posts_of_user" params={{ user_id: user_id }} />;
}
function CommentsOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="/member/comments_of_user" params={{ user_id: user_id }} />;
}

function FollowingFeedList() {
    return <SimplifiedPostList endpoint="/member/feed/get_followed_posts" />;
}

function CommentList(props) {
    return <SimplifiedPostList endpoint="/member/get_comments" params={{ id: props.post.id }} />;
}

function BookmarkList() {
    return <SimplifiedPostList endpoint="/member/get_bookmarks" />;
}

function ExampleUser() {
    return {
        id: -1,
        name: "name",
        username: "username"
    }
}

function ExamplePost() {
    return {
        id: -1,
        repost: false,
        quote: false,
        reposted_post: undefined,
        publisher: ExampleUser(),
        date: new Date("2024-01-01").toISOString(),
        text: "post text",
        images: [default_image],
        views: 9999999,
        repost_count: 353,
        like_count: 4242,
        comment_count: 1234423,
        liked_by_user: false,
        bookmark_count: 10,
        bookmarked_by_user: false,
    };
}

function ExampleQuote() {
    return {
        id: -2,
        repost: false,
        quote: true,
        reposted_post: ExamplePost(),
        publisher: ExampleUser(),
        date: new Date("2024-01-01").toISOString(),
        text: undefined,
        images: undefined,
        views: 0,
        repost_count: 0,
        like_count: 0,
        comment_count: 0,
        liked_by_user: false,
        bookmark_count: 10,
        bookmarked_by_user: false,
    };
}

function ExampleRepost() {
    const reposted_post = ExamplePost();
    return {
        id: reposted_post.id,
        repost: true,
        quote: false,
        reposted_post: ExamplePost(),
        publisher: ExampleUser(),
        date: new Date("2024-01-01").toISOString(),
        text: undefined,
        images: undefined,
        views: 0,
        repost_count: 0,
        like_count: 0,
        comment_count: 0,
        liked_by_user: false,
        bookmark_count: 10,
        bookmarked_by_user: false,
    };
}

function BlockImage(props) {
    return (
        <div style={{
            flex: 1,
            aspectRatio: "1 / 1",
            overflow: "hidden",
            position: "relative"
        }}
            onClick={props.onClick}>
            <img src={props.src} style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
            }} />
            {props.children}
        </div>
    )
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

function PostMedia(props) {
    const spacing = "2px";
    const images = props.images;

    function Show(index, e) {
        e.stopPropagation();
        ShowImage(images, index);
    }

    function ClickableImage(props) {
        return (
            <BlockImage src={images[props.index]} onClick={(e) => { Show(props.index, e); }}>
                {props.children}
            </BlockImage>
        );
    }

    if (images && images.length > 0) {
        let imageElements;
        const count = images.length;
        if (count === 1) {
            imageElements = (
                <ClickableImage index={0} />
            );
        }
        else if (count === 2) {
            imageElements = (
                <>
                    <Stack direction="row" spacing={spacing}>
                        <ClickableImage index={0} />
                        <ClickableImage index={1} />
                    </Stack>
                </>);
        }
        else if (count === 3) {
            imageElements = (
                <>
                    <Stack direction="row" spacing={spacing}>
                        <ClickableImage index={0} />
                    </Stack>
                    <Stack direction="row" spacing={spacing}>
                        <ClickableImage index={1} />
                        <ClickableImage index={2} />
                    </Stack>
                </>);
        }
        else if (count >= 4) {
            imageElements = (
                <>
                    <Stack direction="row" spacing={spacing}>
                        <ClickableImage index={0} />
                        <ClickableImage index={1} />
                    </Stack>
                    <Stack direction="row" spacing={spacing}>
                        <ClickableImage index={2} />
                        <ClickableImage index={3}>
                            {count > 4 &&
                                <Box sx={{ backgroundColor: "transparentBlack.main", }} style={{ position: "absolute", width: "100%", height: "100%", top: "0", left: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography variant="medium_bold" color="primary.contrastText">+{count - 4}</Typography>
                                </Box>
                            }
                        </ClickableImage>
                    </Stack>
                </>);
        }

        return (
            <Box border={1} borderColor="divider" style={{
                margin: "10px 0px",
                overflow: "hidden",
                borderRadius: "10px",
                boxSizing: "border-box"
            }}>
                <Stack direction="column" spacing={spacing}>
                    {imageElements}
                </Stack>
            </Box>
        );
    }
}
function PostText(props) {
    return (
        <Typography variant="small">
            {props.post.text}
        </Typography>
    );
}

function ManagePost(props) {
    return (
        <IconButton size="small" style={{ marginLeft: "auto" }}><Icon fontSize="small">more_horiz</Icon></IconButton>
    );
}

function FromUser(props) {
    if (props.post.repost)
        return (
            <TextRow>
                <Typography variant="small_fade">
                    From
                </Typography>
                <UserName user={ExampleUser()} />
            </TextRow>
        );
}

function RepostedOrQuoted(props) {
    if (props.post.repost || props.post.quote) {
        return (
            <RowWithPrefix
                prefix={<Icon color="secondary" style={{ fontSize: "15px", alignSelf: "end" }}>loop</Icon>}
                contents={
                    <FadeLink style={{ fontWeight: "bold", overflow: "hidden" }}>
                        <TextRow>
                            <span color="secondary.main" style={noOverflow}>
                                <GetUserName user={props.post.publisher} />
                            </span>
                            <span>{props.post.repost ? "reposted" : "quoted"}</span>
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
        <ListItem disablePadding sx={{ borderBottom: 1, borderColor: "divider" }}>
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

    post.images = GetPostPictures(post.id, post.image_count);
    post.publisher = {
        id: post.poster_id,
        name: post.poster_name,
        username: post.poster_username
    };
}

//if this is a repost, the data of the reposted post will be displayed instead of the original post
function OverrideWithRepost(post) {
    if (post.repost) {
        return post.reposted_post;
    }
    return post;
}


export { Post, PostList, PostFocused, ListBlockButton, ListBlock, RowWithPrefix, PostButtonRow, WritePost, CommentList, FeedList, BookmarkList, FollowingFeedList, AddDataToPost, OverrideWithRepost, PostsOfUser, CommentsOfUser };
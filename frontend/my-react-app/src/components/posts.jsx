import React, { useState, useRef, useEffect, forwardRef, createContext, useContext, useImperativeHandle, memo } from "react";
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
import { ResponsiveSelector, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, GetPostMedia, OnlineList, SimplePopOver, formatNumber, UserLink, ReplyingFrom, ToggleFollow, ToggleBlock, InheritLink, ProfilePic } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton, BlueCenterButton } from "/src/components/buttons.jsx";
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
import { Endpoint, FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import { Error, Modals, ShowImage, ShowSingleImage } from "/src/components/modals";
import { useNavigate } from "react-router-dom";
import { ManagePost } from "/src/components/manage_content_button.jsx";
import { ExamplePost, ExampleUser } from "/src/components/exampleData.js";
import { PostCreator, findAndColorHashtags } from "/src/components/post_creator.jsx";
import { BlockMedia } from "/src/components/media.jsx";
import { BlueTextButton } from "/src/components/containers";

const commentSections = {};

function Prefix(props) {
    return (
        <div style={{ display: "flex", justifyContent: "end", padding: "0px 10px", flexShrink: 0,width:60 }}>
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
                        <ManagePost post={overriden} />
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
                        <PostButtonRow post={overriden} key={overriden.id}/>
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

function OpenPostOnClick(props) {
    const link = "/posts/" + props.id;
    return (
        <OpenOnClick link={link}>
            {props.children}
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
                            <ManagePost post={overriden} />
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

function PostButtonRow(props) {
    let post = props.post;
    if (post === undefined)
        post = ExamplePost();
    const { count: like_count, active: liked, pressed: handleLike } = CountableButton(post, post.like_count, post.liked_by_user, "/member/general/like");
    const { count: bookmark_count, active: bookmarked, pressed: handleBookmark } = CountableButton(post, post.bookmark_count, post.bookmarked_by_user, "/member/general/bookmark");
    const { count: repost_count, active: reposted, pressed: handleRepost } = CountableButton(post, post.repost_count, post.reposted_by_user, "/member/general/repost");
    const [comment_count, set_comment_count] = useState(post.comment_count);

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
        <div style={{ width: "500px", padding: "20px", maxWidth: "100%", boxSizing: "border-box" }}>
            {props.children}
        </div>
    );
}

function CountableButton(post, initial_count, initial_active, url) {
    const [like, setLike] = useState(initial_active);
    const last_updateRef = useRef(initial_active);

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

            //prevent duplicated requests
            if (last_updateRef.current !== newValue) {
                last_updateRef.current = newValue;
                updateServer(newValue);
            }

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

const HideablePostMemo = memo((props) => {
    const post = props.entry;
    const [hidden, setHidden] = useState(post.publisher.is_blocked)
    if (!hidden)
        return (<Post post={post} />);
    else if (post.replying_to !== null)//comments are visible in an alternative way if the user is blocked
        return (<BlockedComment unHide={() => { setHidden(false) }} />);
});

function PostList({ post, ...props }) {
    const onlineListRef = useRef();
    const [key, setKey] = useState(post ? post.id : -1);

    async function GetEntries(from) {
        try {
            const new_posts = await props.getPosts(from);
            return new_posts;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    //make the comment section globally accessable
    useEffect(() => {
        const thisCommentSection = {};
        thisCommentSection.addPost = (newPost) => { onlineListRef.current.AddEntryToTop(newPost) };
        thisCommentSection.update = () => { setKey((prev) => prev + 1) };
        thisCommentSection.post = post ? post.id : null;//what post belongs to this comment section? null if this is the main feed
        commentSections.active = thisCommentSection;
    }, []);

    return (
        <OnlineList getEntries={GetEntries} EntryMapper={HideablePostMemo} ref={onlineListRef} key={key} />
    );
}

function SimplifiedPostList({ endpoint, params: additional_params, post }) {
    async function getPosts(from) {
        let params = { from: from };
        if (additional_params)
            params = { ...params, ...additional_params };
        const response = await axios.post(Endpoint(endpoint), params);
        return response.data;
    }
    return <PostList getPosts={getPosts} post={post} />;
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

function ClickableImage({ index, children }) {
    const medias = useContext(MediaContext);
    const media = medias[index];

    function Clicked(index, e) {
        e.stopPropagation();
        ShowImage(medias, index);
    }
    return (
        <BlockMedia media={media} onClick={(e) => { Clicked(index, e); }}>
            {children}
        </BlockMedia>
    );
}


function ClickableSingleImageContainer({ media, children, style, disabled }) {
    function Clicked(e) {
        if (disabled)
            return;

        e.stopPropagation();
        if (media.type !== undefined)
            ShowSingleImage(media);
    }
    return (
        <div onClick={Clicked} style={{ ...style, cursor: "pointer" }}>
            {children}
        </div>
    );
}

const MediaContext = createContext([]);

function PostMedia(props) {
    const spacing = "2px";
    const medias = props.medias;

    if (medias && medias.length > 0) {
        let imageElements;
        const count = medias.length;
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
                        <ClickableImage index={3} >
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
                <MediaContext.Provider value={medias}>
                    <Stack direction="column" spacing={spacing}>
                        {imageElements}
                    </Stack>
                </MediaContext.Provider>
            </Box>
        );
    }
}
function PostText(props) {
    return (
        <Typography variant="small" style={{ wordWrap: "break-word" }} dangerouslySetInnerHTML={{ __html: findAndColorHashtags(props.post.text) }} />
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


export { Post, PostList, PostFocused, ListBlockButton, ListBlock, RowWithPrefix, PostButtonRow, WritePost, OverrideWithRepost, MediaContext, ClickableImage, PostModalFrame, OpenPostOnClick, OpenOnClick, SimplifiedPostList, commentSections, BorderlessPost, PostMedia, ClickableSingleImageContainer, QuotedFrame };
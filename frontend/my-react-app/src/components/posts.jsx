import React, { useState, useRef, useEffect } from "react";
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
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, default_image, GetPostPictures } from '/src/components/utilities';
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
import { Endpoint, FormatAxiosError } from "/src/communication.js";
import { Error, Modals, ShowImage } from "/src/components/modals";

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
    function OpenPost() {
        window.open("/posts/" + props.post.id, "_self");
    }
    return (
        <ListBlockButton>
            <div onClick={OpenPost}>
                <Reposted post={props.post} />
                <RowWithPrefix
                    prefix={<Avatar src={GetProfilePicture(props.post.publisher)} />}
                    contents={
                        <Stack direction="column" style={{ overflow: "hidden" }}>
                            <Stack direction="row" spacing={0.25} style={{ alignItems: "center" }}>
                                <UserName user={props.post.publisher} />
                                <UserKey user={props.post.publisher} />
                                ·
                                <DateLink passed isoString={props.post.date} />
                                <ManagePost />
                            </Stack>
                            <PostText post={props.post} />
                            <PostMedia images={props.post.images} />
                        </Stack>
                    } />
                <RowWithPrefix contents={
                    <Stack direction="column" style={{ overflow: "hidden" }}>
                        <FromUser post={props.post} />
                        <PostButtonRow post={props.post} />
                    </Stack>
                } />
            </div>
        </ListBlockButton>
    );
}

function PostFocused(props) {
    return (
        <ListBlock>
            <Reposted post={props.post} />
            <RowWithPrefix
                prefix={<Avatar src={GetProfilePicture(props.post.publisher)} />}
                contents={
                    <Stack direction="column" style={{ overflow: "hidden" }}>
                        <Stack direction="row" spacing={0.25} style={{ alignItems: "center" }}>
                            <ProfileText user={props.post.publisher} />
                            <Fab variant="extended" size="small" color="black" style={{ flexShrink: 0 }}>Subscribe</Fab>
                            <ManagePost />
                        </Stack>
                    </Stack>
                } />

            <Stack direction="column" sx={{ overflow: "hidden", mt: 1 }}>
                <PostText post={props.post} />
                <PostMedia images={props.post.images} />
                <FromUser post={props.post} />
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "baseline", my: 1 }}>
                    <DateLink passed isoString={props.post.date} />
                    <Typography variant="small_fade">·</Typography>
                    <Typography variant="small_bold">{formatNumber(props.post.views)}</Typography>
                    <Typography variant="small_fade">Views</Typography>
                </Stack>
            </Stack>

            <Divider />

            <Box sx={{ my: 1 }}>
                <PostButtonRow post={props.post} />
            </Box>

            <Divider />

            <PostCreator post={props.post} />
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
        if (isComment)
            formData.append("replying_to", props.post.id);

        await axios.post(
            Endpoint(isComment ? "/member/create/comment" : '/member/create/post'),
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
    }

    return (
        <>
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
        </>
    );
}

function formatNumber(number) {
    const units = [
        [1000000000, "B"],
        [1000000, "M"],
        [1000, "k"],
    ]

    for (let n = 0; n < units.length; n++) {
        const unit = units[n];
        const [multiplier, name] = unit;
        if (multiplier <= number) {
            const divided = Math.round(number / multiplier);
            return divided + name;
        }
    }
    return number;
}

function PostButtonRow(props) {
    const post = props.post;
    const { count: like_count, active: liked, pressed: handleLike } = CountableButton(post, post.like_count, post.liked_by_user, "/member/like");
    const { count: bookmark_count, active: bookmarked, pressed: handleBookmark } = CountableButton(post, post.bookmark_count, post.bookmarked_by_user, "/member/bookmark");


    async function handleComment() {
        console.log("open comment dialog");
    }

    async function handleShare() {
    }

    return (
        <Stack direction="row" justifyContent="space-between" style={{ flexGrow: 1 }} >

            <PostBottomIcon text={formatNumber(post.comment_count)}
                active_icon="chat_bubble_outline"
                inactive_icon="chat_bubble_outline"
                active_color="primary.main"
                onClick={handleComment} />

            <PostBottomIcon text={formatNumber(post.repost_count)}
                active_icon="loop"
                inactive_icon="loop"
                active_color="colors.share" />

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
        </Stack>
    );
}

function CountableButton(post, initial_count, initial_active, url) {
    const [like, setLike] = useState(initial_active);
    function handleLike() {
        setLike((prev) => {
            const newValue = !prev;

            async function updateServer(newValue) {
                try {
                    await axios.post(Endpoint(url), { post: post.id, value: newValue });
                }
                catch {
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

function PostList() {
    async function GetEntries(from) {
        try {
            const response = await axios.post(Endpoint("/member/feed/get_posts"), { from: from });
            const new_posts = response.data;
            new_posts.forEach((post) => {
                AddDataToPost(post);
            });
            return new_posts;
        }
        catch (err) {
            console.error(err);
            return [];
        }
    }

    function EntryMapper(props) {
        return (<Post post={props.entry} />);
    }
    return (
        <List sx={{ p: 0 }}>
            <OnlineList getEntries={GetEntries} entryMapper={EntryMapper} />
        </List>
    );
}

function CommentList(props) {
    async function GetEntries(from) {
        try {
            const result = await axios.post(Endpoint("/member/get_comments"), {
                id: props.post.id,
                from: from
            });
            const comments = result.data;
            comments.forEach((comment) => {
                AddDataToPost(comment);
            });
            return comments;
        }
        catch (err) {
            console.error(err);
            return [];
        }
    }

    function EntryMapper(props) {
        return (<Post post={props.entry} />);
    }
    return (
        <List sx={{ p: 0 }}>
            <OnlineList getEntries={GetEntries} entryMapper={EntryMapper} />
        </List>
    );
}

function ExamplePost() {
    return {
        id: -1,
        repost: false,
        reposted_from: UserData.getData.user,
        publisher: UserData.getData.user,
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

function OnlineList(props) {
    const [entries, setEntries] = useState([]);
    const listRef = useRef(null);
    const savedScrollRef = useRef(0);
    const [end, setEnd] = useState(false);
    const [downloading, setDownloading] = useState(false);

    //the minimum distance between the bottom of the screen and the list in px.
    //it is necessary to not reveal the emptyness when reaching the bottom.
    const minUnseenHeight = 2000;

    //check the new height after render, adjust the scrolling
    useEffect(() => {
        window.scrollTo(0, savedScrollRef.current);
        Scrolling();
    }, [entries])

    async function FillEntries() {
        const from = entries.length;
        const results = await GetEntries(from);
        //if no results recieved, then this is the end of the list, do not ask for more entries
        if (results.length === 0) {
            setEnd(true);
            return;
        }
        setEntries((prev) => {
            return prev.concat(results)
        });
        //the scolling would stuck at the bottom when the page is expanded by the new posts,
        //so the last scroll value before rendering must be saved and loaded after rendering
        savedScrollRef.current = window.scrollY;
        setDownloading(false);
    }

    //download new entries when needed
    useEffect(() => {
        if (downloading)
            FillEntries();
    }, [downloading])


    function Scrolling() {
        if (!end) {
            const unseenHeight = listRef.current.getBoundingClientRect().bottom - window.innerHeight;
            if (unseenHeight < minUnseenHeight) {
                setDownloading(true);
            }
        }
    }


    useEffect(() => {
        window.addEventListener("scroll", Scrolling);
        Scrolling();
        return () => { window.removeEventListener("scroll", Scrolling) };
    }, [])

    function EntryMapper(entryprops) {
        return props.entryMapper(entryprops);
    }

    async function GetEntries(from) {
        return await props.getEntries(from);
    }

    return (
        <List sx={{ p: 0 }} ref={listRef}>
            {entries.map((entry, index) => <EntryMapper key={index} entry={entry} />)}
        </List>
    );
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
        <IconButton size="small" onClick={props.onClick}>
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
                <UserName user={props.post.reposted_from} />
            </TextRow>
        );
}

function Reposted(props) {
    if (props.post.repost)
        return (
            <RowWithPrefix
                prefix={<Icon color="secondary" style={{ fontSize: "15px", alignSelf: "end" }}>loop</Icon>}
                contents={<FadeLink style={{ fontWeight: "bold", overflow: "hidden" }}><TextRow><span color="secondary.main" style={noOverflow}><GetUserName user={props.post.publisher} /></span><span>reposted</span></TextRow></FadeLink>} />//clicking leads to the source post
        );
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
    post.repost = post.reposted_from !== null;
    post.images = GetPostPictures(post.id, post.image_count);
    post.publisher = {
        id: post.poster_id,
        name: post.poster_name,
        username: post.poster_username
    }
}


export { Post, PostList, PostFocused, ListBlockButton, ListBlock, RowWithPrefix, PostButtonRow, AddDataToPost, WritePost,CommentList };
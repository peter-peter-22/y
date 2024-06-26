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
import { ResponsiveSelector, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, OnlineList, SimplePopOver, formatNumber, UserLink, ReplyingFrom, ToggleFollow, ToggleBlock, InheritLink, ProfilePic, Loading } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton, BlueTextButton } from "/src/components/buttons.jsx";
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
import { ManagePost } from "/src/components/manage_content_button.jsx";
import { UnblockButton } from "/src/pages/profile";
import { commentSections, BorderlessPost, RowWithPrefix, PostMedia } from "/src/components/posts.jsx";
import { fileToMedia } from "/src/components/media.jsx";
import ContentEditable from 'react-contenteditable'

function PostCreator({ post, quoted, onPost, ...props }) {
    const [isFocused, setIsFocused] = React.useState(false);
    const [getText, setText] = React.useState("");
    const maxLetters = UserData.getData.maxLetters;
    const isComment = post !== undefined;
    const isQuote = quoted !== undefined;
    const [files, setFiles] = useState([]);
    const [medias, setMedias] = useState([]);
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const hashTagsRef=useRef([]);

    const handleFocus = () => {
        setIsFocused(true);
    };

    function handleChange(text) {
        setText(text);
    }

    function handleFile(e) {
        const selected = e.target.files;
        if (selected !== undefined) {
            setFiles((prev) => [...prev, ...selected]);
            for (let n = 0; n < selected.length; n++) {
                const file = selected[n];
                const media = fileToMedia(file);
                setMedias((prev) => [...prev, media]);
            }
        }
    }

    function insertPhoto() {
        inputRef.current.click();
    }

    function Clear() {
        setFiles([]);
        setMedias([]);
        setText("");
    }

    async function submitPost() {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('medias', file)
        }
        );
        formData.append('text', getText);

        let endpoint;
        if (isComment) {
            formData.append("replying_to", post.id);
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
            //hide the post creator when uploading
            setUploading(true);

            //request
            const result = await axios.post(
                Endpoint(endpoint),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            //back to default state
            Clear();
            setUploading(false);

            //update post list on client without refreshing the page
            const post = result.data;
            AddPostToCommentSection(post);

            //call function if defined
            if (onPost)
                onPost();
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    if (uploading) {
        return <Loading />;
    }

    return (
        <Stack direction="column" spacing={1}>
            {isComment && isFocused &&
                <Box sx={{ my: 1 }} >
                    <RowWithPrefix contents={
                        <ReplyingTo post={post} />
                    } />
                </Box>
            }
            <RowWithPrefix
                prefix={
                    <ProfilePic sx={{ my: 1 }} user={UserData.getData.user} />
                }
                contents={
                    <Stack direction="column">
                        <Stack direction={isFocused ? "column" : "row"}>
                            <Box sx={{ pb: 1, pt: 2, display: "inline-flex", flexGrow: 1, position: "relative", overflow: "hidden" }}>
                                <ColorLetters
                                    isComment={props.isComment}
                                    onFocus={handleFocus}
                                    onChangeRaw={handleChange}
                                    value={getText}
                                    onChangeHashtags={(val)=>{hashTagsRef.current=val}}
                                    max_letters={maxLetters}
                                />
                            </Box>

                            <Stack direction="row" alignItems="center" >
                                {isFocused &&
                                    <Stack direction="row" alignItems="center" justifyContent={"space-between"} style={{ flexGrow: 1 }}>
                                        <Stack direction="row" spacing={0.5}>
                                            <input ref={inputRef} type="file" accept={config.accepted_media_types} onChange={handleFile} multiple style={{ display: "none" }} />
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
                        <PostMedia medias={medias} />
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

function ColorLetters({ onChangeRaw, value, isComment, onFocus, max_letters,onChangeHashtags }) {
    let keep = value.substring(0, max_letters);
    let overflow = value.substring(max_letters);
    const [focused, setFocused] = useState(false);

    //color overflow
    overflow = `<mark style="background: #FF000044">${overflow}</mark>`

    //color hashtags
    const hashtags = [];
    keep = keep.replace(/(\#\w+)/g, (found) => {
        hashtags.push(found.substring(1, found.length));
        return '<span style="color:blue">' + found + '</span>'
    });
    if(onChangeHashtags)
        onChangeHashtags(hashtags);

    function updateRaw(e) {
        const text = e.target.value;
        const raw = text.replace(/<[^>]*>?/gm, '');
        if (onChangeRaw)
            onChangeRaw(raw);
    }

    function focus() {
        setFocused(true);
        if (onFocus)
            onFocus();
    }

    function focusOut() {
        setFocused(false);
    }

    function GetText() {
        if (focused || keep.length > 0)
            return keep + overflow;
        else
            return `<span style="opacity:0.5">${isComment ? "Post your reply" : "Write something"}</span>`;
    }    

    return (
        <ContentEditable
            html={GetText()}
            onChange={updateRaw} // handle innerHTML change
            onFocus={focus}
            onBlur={focusOut}
            style={{
                outline: "none",
                width: "100%",
            }}
        />
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

function AddPostToCommentSection(post) {
    const section = commentSections.active;
    if (!section)
        return;

    const myCommentSection = post.replying_to === section.post;
    console.log(post.replying_to + " " + section.post);
    if (!myCommentSection)
        return;

    section.addPost(post);
}


export { PostCreator }
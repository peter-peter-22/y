import { Box, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import axios from 'axios';
import React, { useContext, useRef, useState } from "react";
import { ThrowIfNotAxios } from "/src/communication.js";
import config from "/src/components/config.js";
import { fileToMedia } from "/src/components/media.jsx";
import { ErrorText } from "/src/components/modals";
import { UsePostList } from "/src/components/post_components";
import { PostMediaEditor } from "/src/components/post_media";
import { TextEditor } from "/src/components/post_text";
import { BorderlessPost, QuotedFrame, RowWithPrefix } from "/src/components/posts.jsx";
import { UserContext } from "/src/components/user_data";
import { Loading, ProfilePic, ReplyingTo } from '/src/components/utilities';
import { theme } from "/src/styles/mui/my_theme";

import GifBoxIcon from "@mui/icons-material/GifBoxOutlined";
import InsertPhotoIcon from "@mui/icons-material/InsertPhotoOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";

function PostCreator({ post, quoted, onPost, editing }) {
    const postList = UsePostList();
    const { getData } = useContext(UserContext);
    const [isFocused, setIsFocused] = React.useState(false);
    const [getText, setText] = React.useState(editing ? editing.text : "");
    const maxLetters = getData.maxLetters;
    const isComment = Boolean(post);
    const isQuote = quoted !== undefined;
    const isEditing = editing !== undefined;
    const [files, setFiles] = useState([]);
    const [medias, setMedias] = useState(editing && editing.mediaObjects ? editing.mediaObjects : []);
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [deletedCloud, setDeletedCloud] = useState([]);

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

    function notImplemented() {
        ErrorText("Not implemented");
    }

    function onDelete(index) {
        //get the deleted media object
        const media = medias[index];

        //remove from the media array
        setMedias((prev) => prev.filter((m, i) => i !== index));

        //if local file then remove from the local files, 
        //if cloud file then add to the deleted cloud files list
        if (media.is_local())
            setFiles((prev) => prev.filter((file) => file !== media.local_file));
        else
            setDeletedCloud((prev) => [...prev, media.filedata.public_id]);
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
        if (isEditing) {
            deletedCloud.forEach(deleted => {
                formData.append("deleted_media", deleted);
            });
            formData.append("id", editing.id);
            endpoint = "member/edit/post";
        }
        else if (isComment) {
            formData.append("replying_to", post.id);
            endpoint = "member/create/comment";
        }
        else if (isQuote) {
            formData.append("quoted", quoted.id);
            endpoint = "member/create/quote";
        }
        else {
            endpoint = "member/create/post";
        }

        try {
            //hide the post creator when uploading
            setUploading(true);

            //request
            const result = await axios.post(
                endpoint,
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
            if (!editing)
                AddPostToCommentSection(post, postList);
            else
                postList.mapRows((row) => {
                    if (row.id === editing.id) {
                        return { ...row };//this will update the post even if it is currently visible
                    }
                    return row;
                });

            //call function if defined
            if (onPost)
                onPost(post);
        }
        catch (err) {
            setUploading(false);
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
                        <ReplyingTo user={post.publisher} />
                    } />
                </Box>
            }
            <RowWithPrefix
                prefix={
                    <ProfilePic sx={{ my: 1 }} user={getData.user} />
                }
                contents={
                    <Stack direction="column">
                        <Stack direction={isFocused ? "column" : "row"}>
                            <Box sx={{ pb: 1, pt: 2, display: "inline-flex", flexGrow: 1, position: "relative", overflow: "hidden" }}>
                                <PostTextEditor
                                    startText={getText}
                                    isComment={isComment}
                                    onFocus={handleFocus}
                                    onChangeRaw={handleChange}
                                    max_letters={maxLetters}
                                />
                            </Box>

                            <Stack direction="row" alignItems="center" >
                                {isFocused &&
                                    <Stack direction="row" alignItems="center" justifyContent={"space-between"} style={{ flexGrow: 1 }}>
                                        <Stack direction="row" spacing={0.5}>
                                            <input ref={inputRef} type="file" accept={config.accepted_media_types} onChange={handleFile} multiple style={{ display: "none" }} />
                                            <CommentButton onClick={insertPhoto}><InsertPhotoIcon /></CommentButton>
                                            <CommentButton onClick={notImplemented}><GifBoxIcon /></CommentButton>
                                            <CommentButton onClick={notImplemented}><SentimentSatisfiedAltIcon /></CommentButton>
                                            <CommentButton onClick={notImplemented}><LocationOnIcon /></CommentButton>
                                        </Stack>

                                        <LetterCounter maxvalue={maxLetters} letters={getText.length} />
                                    </Stack>
                                }
                                <Fab disabled={getText.length === 0 || getText.length > maxLetters} variant="extended" size="small" color="primary" onClick={submitPost}>{get_publish_message(isComment, isEditing)}</Fab>
                            </Stack>

                        </Stack>
                        <PostMediaEditor medias={medias} onDelete={onDelete} />
                    </Stack>
                } />

            {isQuote &&
                <QuotedFrame>
                    <BorderlessPost post={quoted} />
                </QuotedFrame>
            }

        </Stack>
    );
}

function get_publish_message(isComment, isEditing) {
    if (isEditing)
        return "Save";
    if (isComment)
        return "Reply";
    return "Post";
}

function PostTextEditor({ onChangeRaw, isComment, onFocus, max_letters, startText }) {
    return <TextEditor
        onChange={onChangeRaw}
        onFocus={onFocus}
        placeholder={isComment ? "Post your reply" : "Write something"}
        maxLetters={max_letters}
        startText={startText}
    />;
}

function CommentButton(props) {
    return (
        <IconButton color="primary" size="small" onClick={props.onClick}>
            <SvgIcon fontSize="small">
                {props.children}
            </SvgIcon>
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

function AddPostToCommentSection(post, postList) {
    if (!postList)
        return;

    postList.addPost(post);
}


export default PostCreator;


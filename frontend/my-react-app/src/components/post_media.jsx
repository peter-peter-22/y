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
import { BlockMedia } from "/src/components/media.jsx";
import { BlueTextButton } from "/src/components/containers";


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

function PostMedia({ medias }) {
    return (
        <PostMediaContainer medias={medias} Displayer={PostMediaImages} />
    );
}

function PostMediaImages() {
    const spacing = "2px";
    const medias = useContext(MediaContext);
    const count = medias.length;

    const placements = {
        1: [
            [0]
        ],
        2: [
            [0, 1]
        ],
        3: [
            [0],
            [1, 2]
        ],
        4: [
            [0, 1],
            [2, 3]
        ]
    };

    return (
        <Stack direction="column" spacing={spacing}>
            {placements[Math.min(4, count)].map((row, i) => {
                return (
                    <Stack direction="row" spacing={spacing} key={i}>
                        {row.map((image, ii) => {
                            return (
                                <ClickableImage index={image} key={image} >
                                    {image === 3 && count > 4 &&
                                        //add the overlay that show the overflowing images to the last image if there are more than 4 images
                                        <Box sx={{ backgroundColor: "transparentBlack.main", }} style={{ position: "absolute", width: "100%", height: "100%", top: "0", left: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Typography variant="medium_bold" color="primary.contrastText">+{count - 4}</Typography>
                                        </Box>
                                    }
                                </ClickableImage>
                            );
                        })}
                    </Stack>
                )
            })}
        </Stack >
    );

    if (count >= 4) {
        return (
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
}

function PostMediaContainer({ medias, Displayer, ...props }) {
    //display nothing if no media
    if (medias === undefined || medias.length === 0)
        return;

    return (
        <Box border={1} borderColor="divider" style={{
            margin: "10px 0px",
            overflow: "hidden",
            borderRadius: "10px",
            boxSizing: "border-box"
        }}>
            <MediaContext.Provider value={medias}>
                <Displayer {...props} />
            </MediaContext.Provider>
        </Box>
    );
}

function PostMediaEditor({ medias, onDelete }) {
    return (
        <PostMediaContainer medias={medias} Displayer={EditableMediaDisplayer} onDelete={onDelete} />
    );
}


function EditableMediaDisplayer({ onDelete }) {
    const medias = useContext(MediaContext);
    return (
        <Grid container>
            {medias.map((media, i) =>
                <Grid item xs={6} key={i}>
                    <ClickableImageEditable onDelete={onDelete} index={i} />
                </Grid>
            )}
        </Grid>
    );
}

function ClickableImageEditable({ index, onDelete }) {
    return (
        <ClickableImage index={index}>
            <CornerButton right onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
            }}>close</CornerButton>
        </ClickableImage>
    );
}

export { ClickableImage, PostMedia, PostMediaEditor, ClickableSingleImageContainer, MediaContext };
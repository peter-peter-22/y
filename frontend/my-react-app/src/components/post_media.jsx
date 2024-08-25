import { Box, Grid, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import React, { createContext, useContext } from "react";
import { CornerButton } from "/src/components/buttons.jsx";
import { BlockMedia } from "/src/components/media.jsx";
import { ShowImage, ShowSingleImage } from "/src/components/modals";


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

export { ClickableImage, ClickableSingleImageContainer, MediaContext, PostMedia, PostMediaEditor };


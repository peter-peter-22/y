import { Backdrop, Box, Icon } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import 'moment/locale/de';
import React, { useRef, useState } from "react";
import { FormatAxiosError } from "/src/communication.js";
import { MediaDisplayer } from "/src/components/media.jsx";
import { ResponsiveSelector } from '/src/components/utilities';

//creating modal data
let Modals = [];

function CreateModal(props) {
    const [modal, setModal] = React.useState();
    const [onClose, setonClose] = React.useState();

    function Show(content, onClose_) {
        setonClose(() => onClose_);
        setModal(content);
    }

    function Close() {
        if (onClose)
            onClose();
        setModal(undefined);
    }

    Modals[props.id] = {
        Close: Close,
        Show: Show
    }

    return (
        <Dialog open={Boolean(modal)} onClose={Close} >
            {modal}
        </Dialog>
    )
}

//creating modal elements
function CreateModals(props) {
    return (
        <>
            <ImagesModal />
            <CreateModal id={0} />
            <CreateModal id={1} />
        </>
    );
}

//specific modals

//error
function Error(err) {
    ErrorText(FormatAxiosError(err));
}

function ErrorText(text) {
    Modals[1].Show(<ErrorModal text={text} />);
}

function ErrorModal(props) {
    return (
        <GenericModal
            title={props.title ? props.title : "Error"}
            text={props.text}
            color="error"
        />
    );
}

function SuccessModal({ title, text }) {
    return (
        <GenericModal
            title={title ? title : "Success"}
            text={text}
            color="success.main"
        />
    );
}

function GenericModal(props) {
    const title = props.title;
    const text = props.text;
    return (
        <>
            {title &&
                <DialogTitle color={props.color}>
                    {title}
                </DialogTitle>
            }
            {text &&
                <DialogContent>
                    <DialogContentText>
                        {text}
                    </DialogContentText>
                </DialogContent>
            }
        </>
    );
}

//image
const ImagesDisplay = {};
function ImagesModal() {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);
    const imagesRef = useRef(null);
    const media = imagesRef.current ? imagesRef.current[index] : undefined;

    ImagesDisplay.Show = (medias, index) => {
        try {
            imagesRef.current = medias;
            setIndex(index);
            setOpen(true);
        }
        catch (err) {
            Error(err);
        }
    };

    ImagesDisplay.ShowSingle = (media) => {
        try {
            imagesRef.current = [media];
            setIndex(0);
            setOpen(true);
        }
        catch (err) {
            Error(err);
        }
    };

    function Close() {
        setOpen(false);
    }

    function Step(steps, event) {
        event.stopPropagation();
        setIndex((prev) => {
            let index_ = prev + steps;
            const length = imagesRef.current.length;
            if (index_ < 0)
                index_ += length;
            else if (index_ >= length)
                index_ -= length;
            return index_;
        });
    }

    // const image = (
    //     <div style={{ flexGrow: 1, height: "100%", width: "100%", backgroundImage: "url(" + url + ")", backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "contain" }} />
    // );

    const DisplayedMedia = (
        <MediaDisplayer
            media={media}
            style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                backgroundColor: "black"
            }}
            onClick={(e) => { e.stopPropagation() }}
        />
    );

    return (
        <Modal open={open} onClick={Close}>
            <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <Stack direction="column" style={{ height: "80%", width: "95%", alignItems: "center", justifyContent: "center" }}>
                    {DisplayedMedia}
                    <Stack direction="row" style={{ width: "100%" }}>
                        <StepButton icon="arrow_left" onClick={(e) => { Step(-1, e); }} />
                        <StepButton icon="arrow_right" onClick={(e) => { Step(1, e); }} />
                    </Stack>
                </Stack>
            </div>
        </Modal>
    );
}

function StepButton(props) {
    return (
        <Box sx={{
            display: "flex", width: props.tall ? "50px" : "100%", height: props.tall ? "100%" : "50px", justifyContent: "center", alignItems: "center",
            fontSize: "50px", "&:hover": { fontSize: "75px" }
        }}
            onClick={props.onClick}>
            <Icon sx={{ color: "primary.contrastText", fontSize: "inherit" }}>
                {props.icon}
            </Icon>
        </Box >
    );
}

function ShowImage(images, imageIndex) {
    ImagesDisplay.Show(images, imageIndex);
}

function ShowSingleImage(media) {
    ImagesDisplay.ShowSingle(media);
}

export { CreateModals, Error, ErrorModal, ErrorText, ImagesDisplay, Modals, ShowImage, ShowSingleImage, SuccessModal };

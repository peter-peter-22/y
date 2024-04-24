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
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, logo, creation, CenterLogo, default_profile, FollowDialog } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton, WideButton, OutlinedButton } from "/src/components/buttons.jsx";
import { Grid } from '@mui/material';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { theme } from "/src/styles/mui/my_theme";
import { PlainTextField, PasswordFieldWithToggle } from "/src/components/inputs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import 'moment/locale/de';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import { Endpoint, FormatAxiosError } from "/src/communication.js";
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';

function ErrorModal(props) {
    return (
        <>
            <DialogTitle color="error">
                {props.title ? props.title : "Error"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {props.text}
                </DialogContentText>
            </DialogContent>
        </>
    );
}

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
            <CreateModal id={0} />
            <CreateModal id={1} />
        </>
    );
}

function Error(err) {
    ErrorText(FormatAxiosError(err));
}

function ErrorText(text) {
    Modals[1].Show(<ErrorModal text={text} />);
}

export { ErrorModal, Modals, CreateModals, Error, ErrorText };
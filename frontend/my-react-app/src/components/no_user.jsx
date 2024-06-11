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
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, logo, creation, CenterLogo, FollowDialog } from '/src/components/utilities';
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
import { Endpoint } from "/src/communication.js";
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import { UserData } from "/src/App.jsx";
import CreateAccount from "/src/components/create_account.jsx";
import Login from "/src/components/login.jsx";
import { Error, Modals } from "/src/components/modals";

export default () => {
    function showCreator()//show local registration inputs
    {
        Modals[0].Show(<CreateAccount pages={[0, 1, 2, 3, 4]} key="local"/>);
    }

    function showLogin() {
        Modals[0].Show(<Login />)
    }

    return (
        <div style={{ height: "100vh" }}>

            <Stack direction="column" style={{ height: "100%" }}>
                <Stack direction="row" style={{ justifyContent: "space-evenly", alignItems: "center", flexGrow: 1 }}>
                    <img src={logo} style={{ height: "350px" }} />
                    <Stack direction="column">
                        <Typography variant="h2" fontWeight="bold" sx={{ my: 5 }}>
                            Happening now
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                            Join today.
                        </Typography>
                        <Stack direction="column" spacing={1} style={{ width: "300px" }}>
                            <a href={Endpoint("/auth/google")}><AlternativeLogin src="/svg/google.svg" text="Sign-up with Google" /></a>
                            <a href={Endpoint("/auth/github")}><AlternativeLogin src="/svg/github.svg" text="Sign-up with Github" /></a>
                            <Stack direction="row" sx={{ my: 0.5, alignItems: "center" }}>
                                <Or />
                            </Stack>
                            <WideButton size="medium" color="primary" onClick={showCreator}>
                                Create account
                            </WideButton>
                            <ByRegistering variant="verysmall_fade" />
                            <Typography variant="medium_bold" sx={{ pt: 5 }}>Do you already have an account?</Typography>
                            <OutlinedButton size="medium" onClick={showLogin}>
                                <Typography variant="medium_bold" color="primary" >Sign-in</Typography>
                            </OutlinedButton>
                        </Stack>
                    </Stack>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ my: 2, mx: 5, justifyContent: "center" }}>
                    <FadeLink href="#">test</FadeLink>
                    <FadeLink href="#">test</FadeLink>
                    <FadeLink href="#">test</FadeLink>
                    <FadeLink href="#">test</FadeLink>
                    <FadeLink href="#">test</FadeLink>
                    <FadeLink href="#">test</FadeLink>
                    <FadeLink href="#">test</FadeLink>
                    <FadeLink href="#">test</FadeLink>
                    <FadeLink href="#">test</FadeLink>
                    <Typography variant="small_fade">{creation}</Typography>
                </Stack>
            </Stack>
        </div>
    );
}

function AlternativeLogin(props) {
    return (
        <OutlinedButton onClick={props.onClick} size={props.size ? props.size : "medium"}>
            <TextRow>
                <img src={props.src} style={{ height: "1.5em" }} />
                <span>{props.text}</span>
            </TextRow>
        </OutlinedButton >
    );
}

function GrowingLine() {
    return (
        <Divider style={{ flexGrow: 1 }} />
    );
}

function Or() {
    return (
        <>
            <GrowingLine />
            <Typography variant="small_fade" sx={{ mx: 1 }}>or</Typography>
            <GrowingLine />
        </>
    );
}


function BigModal(props) {
    return (
        <Box style={{ width: 600, height: 650 }}>
            {props.children}
        </Box>
    );
}

function ByRegistering(props) {
    return (
        <Typography {...props}>By registering you accept our <Link href="#">End-user agreement</Link> and <Link href="#">Cookie policy</Link> including <Link href="#">Privacy policy</Link></Typography>
    );
}

function BottomButtonWithBorder(props) {
    return (
        <Box borderTop={1} borderColor="divider">
            <ModalMargin>
                <WideButton color="black" sx={{ my: 3, boxSizing: "border-box" }}
                    onClick={props.onClick}>{props.text}</WideButton>
            </ModalMargin>
        </Box>
    );
}

function ModalMargin(props) {
    return (
        <InheritAndMargin mx={10}>
            {props.children}
        </InheritAndMargin>
    );
}

function BigModalMargin(props) {
    return (
        <InheritAndMargin mx={15}>
            {props.children}
        </InheritAndMargin>
    );
}

function InheritAndMargin(props) {
    return (
        <Box sx={{ px: props.mx, boxSizing:"border-box", display: "inherit", flexDirection: "inherit", height: "inherit", justifyContent: "inherit", alignItems: "inherit",gap:"inherit" }}>
            {props.children}
        </Box>
    );
}


export { AlternativeLogin, GrowingLine, BigModal, Or, BottomButtonWithBorder, ByRegistering, ModalMargin, BigModalMargin }
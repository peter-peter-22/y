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
import { PlainTextField, PasswordFieldWithToggle, VisuallyHiddenInput } from "/src/components/inputs";
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
import Dialog from '@mui/material/Dialog';
import { UserData } from "/src/App.jsx";
import { Error, Modals } from "/src/components/modals";
import { AlternativeLogin, GrowingLine, BigModal, Or, BottomButtonWithBorder, ByRegistering, margin, bigmargin } from "/src/components/no_user";

function Login(props) {
    //pages
    const pages = {
        choose: 0,
        password: 1
    }
    const [page, setPage] = useState(pages.choose);

    function handleBack() {
        if (page === pages.choose)
            Modals[0].Close();
        else
            setPage(pages.choose);
    }

    //email
    const [email, setEmail] = useState("");
    const [emailError, setemailError] = useState("");

    function handleEmail(e) {
        setEmail(e.target.value);
    }
    async function submitEmail() {
        try {
            await axios.post(Endpoint('/user/exists/email'),
                {
                    email: email
                },
            );
            setPage(pages.password);
        } catch (error) {
            let text;
            if (error.response&&error.response.status === 400)
                text = "No Y user belongs to this email";
            else
                text = FormatAxiosError(error);
            Modals[1].Show(<Error text={text} />);
            console.log(error);
        }
    }

    //password
    const [password, setPassword] = useState("");
    function handlePassword(value) {
        setPassword(value);
    }
    async function submitPassword() {
        try {
            await axios.post(Endpoint('/login'),
                {
                    email: email,
                    password: password
                },
            );
            UserData.update();
            Modals[0].Close();
        } catch (error) {
            Modals[1].Show(<Error text={FormatAxiosError(error)} />);
        }
    }

    //forgot
    function handleForgot() {
        console.log(email);
    }

    let currentPage;
    switch (page) {
        case pages.choose:
            currentPage = (
                <Stack direction="column" sx={{ mx: bigmargin, height: "100%" }}>
                    <CenterLogo />
                    <Typography variant="verybig_bold" sx={{ my: 4 }}>Sign-in to Y!</Typography>

                    <Stack direction="column" spacing={2}>
                        <AlternativeLogin size="small" src="/svg/google.svg" text="Sign-up with Google" />
                        <AlternativeLogin size="small" src="/svg/google.svg" text="Sign-up with Google" />
                        <Stack direction="row" sx={{ my: 0.5, alignItems: "center" }}>
                            <Or />
                        </Stack>
                        <TextField autoComplete="email" variant="outlined" type="text" label="Email" onChange={handleEmail} value={email} />
                        <WideButton onClick={submitEmail} size="small" color="black">Next</WideButton>
                        <OutlinedButton onClick={handleForgot} size="small">Forgot password?</OutlinedButton>
                        <Box sx={{ mt: 3 }}>
                            <NoAccount close={props.close} />
                        </Box>
                    </Stack>

                </Stack>
            );
            break;

        case pages.password:
            currentPage = (
                <Stack direction="column" sx={{ mx: bigmargin, height: "100%" }}>
                    <CenterLogo />
                    <Typography variant="verybig_bold" sx={{ my: 4 }}>Enter your password!</Typography>
                    <TextField variant="outlined" type="text" label="Email" value={email} disabled sx={{ mb: 3 }} />
                    <PasswordFieldWithToggle variant="outlined" label="Password" sx={{ mb: 3 }}
                        handlechange={handlePassword} value={password} />
                    <Link>Forgot password?</Link>
                    <WideButton onClick={submitPassword} size="medium" color="black" sx={{ mt: "auto", mb: 3 }}>Sign-in</WideButton>
                    <Box sx={{ mb: 3 }}>
                        <NoAccount close={props.close} />
                    </Box>
                </Stack>
            );
            break;
    }

    return (
        <BigModal close={props.close} open={true}>
            <CornerButton onClick={handleBack}>{page === pages.choose ? "close" : "arrow_back"}</CornerButton>
            {currentPage}
        </BigModal>
    );
}

function NoAccount(props) {
    return (
        <Typography variant="small_fade">You have no account? <Link onClick={props.close}>Register</Link></Typography>
    );
}

export default Login;
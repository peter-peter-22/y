import React, { useState, useRef, useEffect } from "react";
import Stack from '@mui/material/Stack';
import  { Inside } from "./side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, logo, creation, CenterLogo, FollowDialog } from '/src/components/utilities';
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
import { Endpoint, FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import { UserData } from "/src/components/user_data";
import { Error, Modals, ErrorText,SuccessModal } from "/src/components/modals";
import { AlternativeLogin, GrowingLine, BigModal, Or, BottomButtonWithBorder, ByRegistering, ModalMargin, BigModalMargin } from "/src/components/no_user";
import { RechaptaInput, validateEmail, EmailInput } from "/src/components/create_account";

function Login(props) {
    //shared data
    const dataRef = useRef({});

    //pages
    const pages = [
        ChooseMethod,
        EnterPassword,
        ForgotPassword
    ]
    const [page, setPage] = useState(0);

    function handleBack() {
        if (page === 0)
            Close()
        else
            setPage(0);
    }

    const CurrentPage = pages[page];

    return (
        <BigModal close={props.close} open={true}>
            <CornerButton onClick={handleBack}>{page === pages.choose ? "close" : "arrow_back"}</CornerButton>
            <CurrentPage dataRef={dataRef} setPage={setPage} />
        </BigModal>
    );
}

function EnterPassword(props) {
    const dataRef = props.dataRef;
    const email = dataRef.current.email;

    //password
    const [password, setPassword] = useState("");
    function handlePassword(e) {
        const value = e.target.value;
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
            await UserData.update();
            Close();
        } catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <BigModalMargin>
                <CenterLogo />
                <Typography variant="verybig_bold" sx={{ my: 4 }}>Enter your password!</Typography>
                <TextField variant="outlined" type="text" label="Email" value={email} disabled sx={{ mb: 3 }} />
                <PasswordFieldWithToggle variant="outlined" label="Password" sx={{ mb: 3 }}
                    onChange={handlePassword} value={password} />
                <Link onClick={() => { props.setPage(2); }} style={{ cursor: "pointer" }}>Forgot password?</Link>
                <WideButton onClick={submitPassword} size="medium" color="black" sx={{ mt: "auto", mb: 3 }}>Sign-in</WideButton>
                <Box sx={{ mb: 3 }}>
                    <NoAccount />
                </Box>
            </BigModalMargin>
        </Stack>
    );
}

function Close() {
    Modals[0].Close();
}

function ChooseMethod(props) {
    const dataRef = props.dataRef;

    //email
    const [email, setEmail] = useState("");

    function handleEmail(e) {
        const value = e.target.value;
        setEmail(value);
        dataRef.current.email = value;
    }
    async function submitEmail() {
        try {
            const res = await axios.post(Endpoint('/user/exists/email'),
                {
                    email: email
                },
            );
            if (res.data)
                props.setPage(1);
            else
                ErrorText("No Y user belongs to this email");
        }  catch (err) {
                ThrowIfNotAxios(err);
            }
    }

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <BigModalMargin>
                <CenterLogo />
                <Typography variant="verybig_bold" sx={{ my: 4 }}>Sign-in to Y!</Typography>

                <Stack direction="column" spacing={2}>
                    <a href={Endpoint("/auth/google")}><AlternativeLogin src="/svg/google.svg" text="Sign-in with Google" /></a>
                    <a href={Endpoint("/auth/github")}><AlternativeLogin src="/svg/github.svg" text="Sign-in with Github" /></a>
                    <Stack direction="row" sx={{ my: 0.5, alignItems: "center" }}>
                        <Or />
                    </Stack>
                    <TextField autoComplete="email" variant="outlined" type="email" label="Email" onChange={handleEmail} value={email} />
                    <WideButton onClick={submitEmail} size="small" color="black">Next</WideButton>
                    <OutlinedButton onClick={() => { props.setPage(2); }} size="small">Forgot password?</OutlinedButton>
                    <Box sx={{ mt: 3 }}>
                        <NoAccount />
                    </Box>
                </Stack>

            </BigModalMargin>
        </Stack>
    );
}

function ForgotPassword(props) {
    const startingEmail = props.dataRef.current.email;
    const [captchaValue, setCaptchaValue] = useState('');
    const [email, setEmail] = useState(startingEmail ? startingEmail : "");
    const [emailError, setEmailError] = useState('');

    function handleCaptchaChange(value) {
        setCaptchaValue(value);
    };

    function handleEmail(e) {
        const value = e.target.value;
        setEmail(value);
        const valid = validateEmail(value);
        if (!valid) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    }

    //submit rechapta
    async function submitChapta() {
        try {
            await axios.post(Endpoint('/user/change_password/submit_chapta'),
                {
                    email: email,
                    recaptchaToken: captchaValue
                },
            );
            //rechapta ok, email sent, show modal
            Modals[0].Show(
                <SuccessModal title={"We sent you an email."}/>
            )
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    };

    return (
        <Stack direction="column" spacing={2} sx={{ height: "100%" }}>
            <CenterLogo />
            <BigModalMargin>
                <EmailInput
                    sx={{ mb: 4 }}
                    onChange={handleEmail}
                    error={Boolean(emailError)}
                    helperText={emailError}
                    value={email} />
                <RechaptaInput onChange={handleCaptchaChange} />
            </BigModalMargin>
            <BottomButtonWithBorder onClick={submitChapta} text="Submit" />
        </Stack>
    );
}

function NoAccount() {
    return (
        <Typography variant="small_fade">You have no account? <Link style={{ cursor: "pointer" }} onClick={Close}>Register</Link></Typography>
    );
}

export default Login;
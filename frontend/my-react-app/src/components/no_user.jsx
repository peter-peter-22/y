import React, { useState } from "react";
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
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, logo, creation } from '/src/components/utilities';
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
import { PlainTextField } from "/src/components/inputs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import 'moment/locale/de';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default () => {
    const [createAccount, setCreateAccount] = useState(false);

    function closeCreator() {
        setCreateAccount(false);
    }

    function showCreator()
    {
        setCreateAccount(true);
    }

    return (
        <div style={{ height: "100vh" }}>
            {createAccount && <CreateAccount close={closeCreator} />}

            <Stack direction="column" style={{ height: "100%", position: "relative", zIndex: 0 }}>
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
                            <AlternativeLogin src="/svg/google.svg" text="Sign-up with Google" />
                            <AlternativeLogin src="/svg/google.svg" text="Sign-up with Google" />
                            <Stack direction="row" sx={{ my: 0.5, alignItems: "center" }}>
                                <GrowingLine />
                                <Typography variant="small_fade" sx={{ mx: 1 }}>or</Typography>
                                <GrowingLine />
                            </Stack>
                            <LoginButton color="primary" onClick={showCreator}>
                                Create account
                            </LoginButton>
                            <Typography variant="verysmall_fade">By registering you accept our <Link href="#">End-user agreement</Link> and <Link href="#">Cookie policy</Link> including <Link href="#">Privacy policy</Link></Typography>
                            <Typography variant="medium_bold" sx={{ pt: 5 }}>Do you already have an account?</Typography>
                            <OutlinedButton size="medium">
                                <Typography variant="medium_bold" color="primary">Sign-in</Typography>
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
        <OutlinedButton size="medium">
            <TextRow>
                <img src={props.src} style={{ height: "1.5em" }} />
                <span>{props.text}</span>
            </TextRow>
        </OutlinedButton >
    );
}

function LoginButton(props) {
    return (
        <WideButton size="medium" {...props}>
            {props.children}
        </WideButton>
    );
}

function GrowingLine() {
    return (
        <Divider style={{ flexGrow: 1 }} />
    );
}

function CreateAccount(props) {
    //constants
    const margin = 10;

    //email
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleEmail = (e) => {
        const value = e.target.value;
        setEmail(value);
        if (!validateEmail(value)) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError('');
        }
    };

    const validateEmail = (email) => {
        // Regular expression to validate email
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    //name
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');

    function handleName(e) {
        const value = e.target.value;
        setName(value);
        if (!validateName(value)) {
            setNameError('The name must be at least 3 characters long.');
        } else {
            setNameError('');
        }
    }

    const validateName = (name) => {
        return name.length >= 3;
    };

    //date
    const [date, setDate] = useState(null);
    const [dateError, setdateError] = useState(true);

    function handleDate(date) {
        setDate(date);
        setdateError(!date.isValid() || date.isAfter() || date.year() < 1900);
    }

    //steps
    const [step, setStep] = useState(0);

    function handleNext() {
        setStep((previousValue) => { return previousValue + 1 });
    }

    function handleBack() {
        if (step === 0)
            props.close();
        else
            setStep((previousValue) => { return previousValue - 1 });
    }

    const step0ok = !nameError && name && !emailError && email && !dateError;

    let currentPage;
    switch (step) {
        case 0:
            currentPage = (
                <Stack direction="column" sx={{ mx: margin, height: "100%" }}>
                    <CenterLogo />
                    <Typography variant="verybig_bold" sx={{ my: 4 }}>Create account</Typography>
                    <TextField autoComplete="name" variant="outlined" type="text" label="Name" inputProps={{ maxLength: "50" }} required sx={{ mb: 3 }}
                        onChange={handleName}
                        error={Boolean(nameError)}
                        helperText={nameError}
                        value={name} />
                    <TextField autoComplete="email" variant="outlined" type="email" label="Email" required sx={{ mb: 4 }}
                        onChange={handleEmail}
                        error={Boolean(emailError)}
                        helperText={emailError}
                        value={email} />
                    <Typography variant="medium_bold" sx={{ mb: 2 }}>Date of birth</Typography>
                    <Typography variant="medium_fade" sx={{ mb: 2 }}>This will not be publicly visible. Verify your own age, even if it's a business account, a pet account, or something else.</Typography>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker required label="Date of birth" disableFuture onChange={handleDate} value={date} />
                    </LocalizationProvider>
                    <WideButton color="black" disabled={!step0ok} sx={{ mt: "auto", mb: 3 }}
                        onClick={handleNext}>Next</WideButton>
                </Stack>
            );
            break;

        case 1:
            currentPage = (
                <Stack direction="column" sx={{ height: "100%" }}>
                    <Stack direction="column" sx={{ mx: margin, flexGrow: 1 }}>
                        <CenterLogo />
                        <Typography variant="verybig_bold" sx={{ my: 4 }}>Personalize your user experience</Typography>
                        <div>
                            <Stack direction="column">
                                <Typography variant="big_bold" sx={{ mb: 1 }}>Get more out of Y</Typography>
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label="Recieve the notifications in email."
                                    labelPlacement="start"
                                    sx={{ mx: 0, justifyContent: "space-between" }}
                                />
                            </Stack>
                        </div>
                    </Stack>
                    <Box borderTop={1} borderColor="divider">
                        <Box sx={{ mx: margin }}>
                            <WideButton color="black" sx={{ my: 3, boxSizing: "border-box" }}
                                onClick={handleNext}>Next</WideButton>
                        </Box>
                    </Box>
                </Stack>
            );
            break;
    }

    return (
        <div style={{ backgroundColor: theme.palette.transparentBlack.main, height: "100%", width: "100%", position: "absolute", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box style={{ backgroundColor: theme.palette.background.default, borderRadius: "10px", width: "600px", height: 650, position: "relative" }}>
                <CornerButton onClick={handleBack}>{step > 0 ? "arrow_back" : "close"}</CornerButton>
                {currentPage}
            </Box>
        </div>
    );
}

function CenterLogo() {
    return (
        <img src={logo} style={{ height: "30px", marginTop: "10px" }} />
    );
}
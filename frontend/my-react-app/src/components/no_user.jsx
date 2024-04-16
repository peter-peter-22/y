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
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, logo, creation,CenterLogo } from '/src/components/utilities';
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
import { PlainTextField,PasswordFieldWithToggle } from "/src/components/inputs";
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

export default () => {
    const [createAccount, setCreateAccount] = useState(false);

    function closeCreator() {
        setCreateAccount(false);
    }

    function showCreator() {
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
<ByRegistering variant="verysmall_fade"/>
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

    //checkboxes
    const [checkboxes, setCheckboxes] = useState();

    function handleCheckboxes(e) {
        console.log(e);
    }

    //rechapta
    const [captchaValue, setCaptchaValue] = useState('');

    function handleCaptchaChange(value) {
        setCaptchaValue(value);
    };

    //submit rechapta
    async function handleSubmit() {
        try {
            await axios.post(Endpoint('/register'),
                {
                    email: email,
                    name: name,
                    birthdate: date,
                    recaptchaToken: captchaValue, // Send the reCAPTCHA token to the backend
                },
                { withCredentials: true }
            );
            //rechapta ok, next page
            handleNext();
        } catch (error) {
            console.error('Error submitting rechapta:', error);
        }
    };

    //verification code
    const [code, setCode] = useState("");

    function handleCode(e) {
        setCode(e.target.value);
    }

    //submit verification code
    async function submitCode() {
        try {
            await axios.post(Endpoint('/verify_code'),
                {
                    code: code
                },
                { withCredentials: true }
            );
            //code ok, next page
            handleNext();
        } catch (error) {
            console.error('Error submitting verification code:', error);
        }
    };

    //password
    const [password, setPassword] = useState('');

    function handlePassword(value) {
        setPassword(value);
    };

    //step handler
    const [step, setStep] = useState(5);

    function handleNext() {
        setStep((previousValue) => { return previousValue + 1 });
    }

    function handleBack() {
        if (step === 0)
            props.close();
        else
            setStep((previousValue) => { return previousValue - 1 });
    }

    //step conditions
    const step0ok = !nameError && name && !emailError && email && !dateError;
    const step3ok = code.length > 0;
    const step4ok = password.length>=8;

    //step renderer
    let currentPage;
    switch (step) {

        case 0://enter email, ect.
            currentPage = (
                <Stack direction="column" sx={{ mx: margin, height: "100%" }}>
                    <CenterLogo />
                    <Typography variant="verybig_bold" sx={{ my: 4 }}>Create account</Typography>
                    <TextField autoComplete="name" variant="outlined" type="text" label="Name" inputProps={{ maxLength: "50" }} sx={{ mb: 3 }}
                        onChange={handleName}
                        error={Boolean(nameError)}
                        helperText={nameError}
                        value={name} />
                    <TextField autoComplete="email" variant="outlined" type="email" label="Email" sx={{ mb: 4 }}
                        onChange={handleEmail}
                        error={Boolean(emailError)}
                        helperText={emailError}
                        value={email} />
                    <Typography variant="medium_bold" sx={{ mb: 2 }}>Date of birth</Typography>
                    <Typography variant="medium_fade" sx={{ mb: 2 }}>This will not be publicly visible. Verify your own age, even if it's a business account, a pet account, or something else.</Typography>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker label="Date of birth" disableFuture onChange={handleDate} value={date} />
                    </LocalizationProvider>
                    <WideButton color="black" disabled={!step0ok} sx={{ mt: "auto", mb: 3 }}
                        onClick={handleNext}>Next</WideButton>
                </Stack>
            );
            break;

        case 1://checkboxes
            currentPage = (
                <Stack direction="column" sx={{ height: "100%" }}>
                    <Stack direction="column" sx={{ mx: margin, flexGrow: 1 }}>
                        <CenterLogo />
                        <Typography variant="verybig_bold" sx={{ my: 4 }}>Personalize your user experience</Typography>
                        <div>
                            <Stack direction="column">
                                <Typography variant="big_bold" sx={{ mb: 1 }}>Get more out of Y</Typography>
                                <FormControlLabel
                                    control={<Checkbox onChange={handleCheckboxes} />}
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

        case 2://rechapta
            currentPage = (
                <Stack direction="column" spacing={2} sx={{ height: "100%" }}>
                    <CenterLogo />
                    <Stack style={{ alignItems: "center", flexGrow: 1 }}>
                        <ReCAPTCHA
                            sitekey="6Ld-x7wpAAAAAI72weXOfrlCY4hmIZ_b1F9FWFik"
                            onChange={handleCaptchaChange}
                        />
                    </Stack>
                    <Box borderTop={1} borderColor="divider">
                        <Box sx={{ mx: margin }}>
                            <WideButton color="black" sx={{ my: 3, boxSizing: "border-box" }}
                                onClick={handleSubmit}>Submit</WideButton>
                        </Box>
                    </Box>
                </Stack>
            );
            break;

        case 3://enter verification code
            currentPage = (
                <Stack direction="column" sx={{ mx: margin, height: "100%" }}>
                    <CenterLogo />
                    <Typography variant="verybig_bold" sx={{ mt: 4 }}>We sent you a verification code</Typography>
                    <Typography variant="small_fade" sx={{ mt: 3 }}>Enter it to the field below to verify {email}</Typography>
                    <TextField variant="outlined" type="text" label="Verification code" sx={{ my: 3 }}
                        onChange={handleCode}
                        value={code} />
                    <WideButton color="black" sx={{ mb: 3, mt: "auto", boxSizing: "border-box" }}
                        onClick={submitCode} disabled={!step3ok}>Submit</WideButton>
                </Stack>
            );
            break;

        case 4://enter password
            currentPage = (
                <Stack direction="column" sx={{ mx: margin, height: "100%" }}>
                    <CenterLogo />
                    <Typography variant="verybig_bold" sx={{ mt: 4 }}>You need a password</Typography>
                    <Typography variant="small_fade" sx={{ mt: 3 }}>At least 8 characters {email}</Typography>
                    <PasswordFieldWithToggle variant="outlined" label="Password" sx={{ my: 3 }}
                        handlechange={handlePassword} />
                        <ByRegistering variant="small_fade" sx={{  mt: "auto"}}/>
                        <Typography variant="small_fade">Y can use your contact informations, including your email address and phone number according to the privacy policy. <Link href="#">See more</Link></Typography>
                    <WideButton color="black" sx={{ my: 3, boxSizing: "border-box" }}
                        onClick={handleNext} disabled={!step4ok}>Next</WideButton>
                </Stack>
            );
            break;

            case 5://upload profile picture
            currentPage = (
                <Stack direction="column" sx={{ mx: margin, height: "100%" }}>
                    <CenterLogo />
                    <Typography variant="verybig_bold" sx={{ mt: 4 }}>Select profile picture!</Typography>
                    <Typography variant="small_fade" sx={{ mt: 3 }}>Do you have a favourite selfie? Upload now! {email}</Typography>
                    <div style={{flexGrow:1,display:"flex",justifyContent:"center",alignItems:"center"}}>
                        <Avatar sx={{height:"200px",width:"200px"}}>
                            <img src="/images/example profile.jpg" style={{height:"100%",width:"100%",objectFit:"cover"}}/>
                            <Fab size="small" color="transparentBlack" sx={{border:1,borderColor:"divider", position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)"}}>
                                <Icon baseClassName="material-icons-outlined">
                                    add_a_photo
                                </Icon>
                            </Fab>
                        </Avatar>
                    </div>
                    <OutlinedButton sx={{ my: 3, boxSizing: "border-box" }}
                        onClick={handleNext}>Skip</OutlinedButton>
                </Stack>
            );
            break;
    }

    //final
    return (
        <div style={{ backgroundColor: theme.palette.transparentBlack.main, height: "100%", width: "100%", position: "absolute", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box style={{ backgroundColor: theme.palette.background.default, borderRadius: "10px", width: "600px", height: 650, position: "relative" }}>
                <CornerButton onClick={handleBack}>{step > 0 ? "arrow_back" : "close"}</CornerButton>
                {currentPage}
            </Box>
        </div>
    );
}

function ByRegistering(props)
{
    return(
        <Typography {...props}>By registering you accept our <Link href="#">End-user agreement</Link> and <Link href="#">Cookie policy</Link> including <Link href="#">Privacy policy</Link></Typography>
    );
}
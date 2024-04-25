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

function CreateAccount(props) {
    const pages = props.pages ? props.pages : [0, 1, 2, 3, 4];
    const timerRef = useRef(null);

    //email
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleEmail = (e) => {
        const value = e.target.value;
        setEmail(value);
        const valid = validateEmail(value);
        if (!valid) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }

        WaitAfterChange(async () => {
            if (valid) {
                const res = await axios.post(Endpoint("/user/exists/email"), {
                    email: value
                });
                if (res.data)
                    setEmailError('This email address is already taken');
            }
        }, timerRef, "email");

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

    const page0ok = !nameError && name && !emailError && email && !dateError;

    //checkboxes
    const [checkboxes, setCheckboxes] = useState([]);

    function handleCheckboxes(e) {
        setCheckboxes((previous) => {
            const toggle = e.target.name;
            if (previous.includes(toggle))
                return (previous.filter(el => el !== toggle));
            else
                return ([...previous, toggle]);
        });
    }

    //rechapta
    const [captchaValue, setCaptchaValue] = useState('');

    function handleCaptchaChange(value) {
        setCaptchaValue(value);
    };

    //submit rechapta
    async function submitChapta() {
        await axios.post(Endpoint('/register_start'),
            {
                email: email,
                name: name,
                birthdate: date.toISOString(),
                recaptchaToken: captchaValue,
                checkboxes: checkboxes
            },
        );
        //rechapta ok, next page
        handleNext();
    };

    //verification code
    const [code, setCode] = useState("");

    function handleCode(e) {
        setCode(e.target.value);
    }

    const codeOk = code.length > 0;

    //submit verification code
    async function submitCode() {
        await axios.post(Endpoint('/verify_code'),
            {
                code: code
            },
        );
        //code ok, next page
        handleNext();
    };

    //password
    const [password, setPassword] = useState('');

    function handlePassword(value) {
        setPassword(value);
    };

    const passwordOk = password.length >= 8;

    async function submitPassword() {
        await axios.post(Endpoint('/submit_password'),
            {
                password: password
            },
        );
        //code ok, next page
        handleNext();
        UserData.update();
    }

    //profile pic
    const [file, setFile] = useState();
    const imageUrlRef = useRef();
    const fileUrl = imageUrlRef.url;

    function handleFile(e) {
        const selected = e.target.files[0];
        setFile(selected);
        if (selected === undefined)
            imageUrlRef.url = undefined;
        else {
            const selectedUrl = URL.createObjectURL(selected);
            imageUrlRef.url = selectedUrl;
        }
    }

    async function submitImage() {
        if (file !== undefined) {
            const formData = new FormData();
            formData.append('image', file);
            await axios.post(
                Endpoint('/member/update_profile_picture'),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            handleNext();
        }
        else
            handleNext();
    }

    //username
    const [username, setUserName] = useState("");
    const [usernameOk, setUserNameOk] = useState(false);

    function handleUsername(e) {
        const value = e.target.value;
        setUserName(value);
        setUserNameOk(false);

        WaitAfterChange(async () => {
            if (value.length > 0) {
                const res = await axios.post(Endpoint("/member/ok_username"), {
                    username: value
                });
                setUserNameOk(res.data);
            }
        }, timerRef, "username");
    }

    async function submitUsername() {
        await axios.post(Endpoint("/member/change_username"), {
            username: username
        });
        handleNext();
    }

    //notifications
    async function setNotifications(enabled) {
        await axios.post(Endpoint("/member/change_browser_notifications"), {
            enabled: enabled
        });
        handleNext();
    }

    //step handler
    const [stepIndex, setStep] = useState(0);
    const allowBack = stepIndex > 0;

    function handleNext() {
        if (stepIndex >= pages.length - 1) {
            if (props.finish)
                send_finish();
            else
                close();
        }
        else
            setStep((previousValue) => { return previousValue + 1 });
    }

    function handleBack() {
        if (!allowBack)
            close();
        else
            setStep((previousValue) => { return previousValue - 1 });
    }
    function close() {
        Modals[0].Close();
    }
    async function send_finish() {
        console.log(date.toISOString());
        await axios.post(Endpoint("/finish_registration"),
            {
                birthdate: date.toISOString(),
                checkboxes: checkboxes
            });
        close();
    }


    //step renderer
    let currentPage;
    const page = pages[stepIndex];
    switch (page) {

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
                    <WideButton color="black" disabled={!page0ok} sx={{ mt: "auto", mb: 3 }}
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
                                    control={<Checkbox name="emails" onChange={handleCheckboxes} />}
                                    label="Recieve the notifications in email."
                                    labelPlacement="start"
                                    sx={{ mx: 0, justifyContent: "space-between" }}
                                />
                            </Stack>
                        </div>
                    </Stack>
                    <BottomButtonWithBorder onClick={handleNext} text={"Next"} />
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
                    <BottomButtonWithBorder onClick={submitChapta} text="Submit" />
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
                    <WideButton color="black" sx={{ mb: 3, mt: "auto" }}
                        onClick={submitCode} disabled={!codeOk}>Submit</WideButton>
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
                        handlechange={handlePassword} value={password} />
                    <ByRegistering variant="small_fade" sx={{ mt: "auto" }} />
                    <Typography variant="small_fade">Y can use your contact informations, including your email address and phone number according to the privacy policy. <Link href="#">See more</Link></Typography>
                    <WideButton color="black" sx={{ my: 3 }}
                        onClick={submitPassword} disabled={!passwordOk}>Next</WideButton>
                </Stack>
            );
            break;

        case 5://upload profile picture
            currentPage = (
                <Stack direction="column" sx={{ mx: margin, height: "100%" }}>
                    <CenterLogo />
                    <Typography variant="verybig_bold" sx={{ mt: 4 }}>Select profile picture!</Typography>
                    <Typography variant="small_fade" sx={{ mt: 3 }}>Do you have a favourite selfie? Upload now! {email}</Typography>
                    <div style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Avatar sx={{ height: "200px", width: "200px" }}>
                            <img src={fileUrl ? fileUrl : default_profile} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                            <Fab size="small" color="transparentBlack" sx={{ border: 1, borderColor: "divider", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                                <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFile} />
                                <Icon baseClassName="material-icons-outlined">
                                    add_a_photo
                                </Icon>
                            </Fab>
                        </Avatar>
                    </div>
                    <Box sx={{ my: 3, boxSizing: "border-box" }}>
                        {file ?
                            <WideButton color="black" onClick={submitImage}>
                                Submit
                            </WideButton>
                            :
                            <OutlinedButton onClick={handleNext}>
                                Skip
                            </OutlinedButton>
                        }
                    </Box>
                </Stack>
            );
            break;

        case 6://enter username
            currentPage = (
                <Stack direction="column" sx={{ mx: margin, height: "100%" }}>
                    <CenterLogo />
                    <Typography variant="verybig_bold" sx={{ mt: 4 }}>How should we call you?</Typography>
                    <Typography variant="small_fade" sx={{ mt: 3 }}>The @username is unique. You can modify it anytime.</Typography>
                    <TextField variant="outlined" type="text" label="Username" sx={{ my: 3 }}
                        onChange={handleUsername}
                        value={username}
                        InputProps={{
                            maxLength: "50",
                            endAdornment: (
                                <InputAdornment position="end">
                                    {usernameOk ? <Icon color="success">check_circle</Icon> : <Icon color="error">cancel</Icon>}
                                </InputAdornment>
                            ),
                            startAdornment: (
                                <InputAdornment position="start">
                                    @
                                </InputAdornment>
                            ),
                        }}
                    />
                    <WideButton color="black" sx={{ my: 3 }}
                        onClick={submitUsername} disabled={!usernameOk}>Next</WideButton>
                </Stack>
            );
            break;

        case 7://notifications
            currentPage = (
                <Stack direction="column" sx={{ mx: margin, height: "100%", justifyContent: "center" }}>
                    <Typography variant="verybig_bold">Enable notifications?</Typography>
                    <Typography variant="small_fade" sx={{ mt: 1, mb: 3 }}>Bring out the most of Y and stay up-to-date about the events.</Typography>
                    <WideButton color="black" sx={{ mb: 2, boxSizing: "border-box" }} onClick={() => { setNotifications(true) }}>Enable</WideButton>
                    <OutlinedButton onClick={() => { setNotifications(false) }}>Not now</OutlinedButton>
                </Stack>
            );
            break;

        case 8://follow
            currentPage = (
                <Stack direction="column" sx={{ height: "100%" }}>
                    <Stack direction="column" sx={{ flexGrow: 1 }}>
                        <CenterLogo />
                        <div style={{ flexGrow: 1, maxHeight: "100%", overflowY: "scroll" }}>
                            <List sx={{ p: 0, mx: margin }}>
                                <FollowDialog />
                            </List>
                        </div>
                    </Stack>
                    <BottomButtonWithBorder onClick={handleNext} text={"Next"} />
                </Stack>
            );
            break;

        case 9://alternative date of birth
            currentPage = (
                <Stack direction="column" sx={{ mx: margin, height: "100%" }}>
                    <CenterLogo />
                    <Typography variant="medium_bold" sx={{ mb: 2 }}>Date of birth</Typography>
                    <Typography variant="medium_fade" sx={{ mb: 2 }}>This will not be publicly visible. Verify your own age, even if it's a business account, a pet account, or something else.</Typography>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker label="Date of birth" disableFuture onChange={handleDate} value={date} />
                    </LocalizationProvider>
                    <WideButton color="black" disabled={Boolean(dateError)} sx={{ mt: "auto", mb: 3 }}
                        onClick={handleNext}>Next</WideButton>
                </Stack>
            );
            break;

    }

    //final
    return (
        <BigModal close={props.close} open={true}>
            <CornerButton onClick={handleBack}>{allowBack ? "arrow_back" : "close"}</CornerButton>
            {currentPage}
        </BigModal>
    );
}

function WaitAfterChange(cb, timerRef, timerName) {
    clearTimeout(timerRef[timerName]);
    timerRef[timerName] = setTimeout(() => {
        cb();
    }, 300);
}

export default CreateAccount;
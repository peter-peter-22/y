import { Box, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import 'moment/locale/de';
import React, { useContext, useRef, useState } from 'react';
import { WhoToFollow } from './footer';
import { ThrowIfNotAxios } from "/src/communication.js";
import { BirthDateEditor, EmailInput, NameEditor, PasswordInput, ProfilePicEditor, RechaptaInput, UserNameEditor, validateEmail,WaitAfterChange } from "/src/components/account_components";
import { CornerButton, OutlinedButton, WideButton } from "/src/components/buttons.jsx";
import { Modals } from "/src/components/modals";
import { BigModal, BottomButtonWithBorder, ByRegistering, ModalMargin, SmallLink } from "/src/components/no_user_components";
import { UserContext } from "/src/components/user_data";
import { CenterLogo } from '/src/components/utilities';
import Ask from "/src/components/web_push.js";

function CreateAccount({ pages = [0], finish, close }) {
    //only the selected pages are rendered

    const { update } = useContext(UserContext);

    //the values of the pages that is not sent to the server directly on submit (like email,birthdate)
    const dataRef = useRef({});

    //step handler
    const [stepIndex, setStep] = useState(0);//the stepindex must be cleared via key when another createaccount is rendered 
    const allowBack = stepIndex > 0;

    function handleNext() {
        if (stepIndex >= pages.length - 1) {
            if (finish)
                finish(dataRef.current, close, update);
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

    //step renderer
    const pageIndex = pages[stepIndex];
    const pageRenderers = [
        Page0,
        Page1,
        Page2,
        Page3,
        Page4,
        Page5,
        Page6,
        Page7,
        Page8,
        Page9,
        Page10,
        Page11
    ];
    const RenderPage = pageRenderers[pageIndex];

    //render the chosen page
    return (
        <BigModal close={close} open={true}>
            <CornerButton onClick={handleBack}>{allowBack ? "arrow_back" : "close"}</CornerButton>
            <RenderPage dataRef={dataRef} handleNext={handleNext} />
        </BigModal>
    );
}

function Page0(props)//enter email, ect.
{
    const [data, handleNext] = GetProps(props);
    const timerRef = useRef();

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
                try {
                    const res = await axios.post("user/exists/email", {
                        email: value
                    });
                    if (res.data)
                        setEmailError('This email address is already taken');
                }
                catch (err) {
                    ThrowIfNotAxios(err);
                }
            }
        }, timerRef);

    };

    //name
    const [name, setName] = useState('');
    const [nameOk, setNameOk] = useState('');

    //date
    const [date, setDate] = useState(null);
    const [dateOk, setDateOk] = useState(true);

    const ok = nameOk && name && !emailError && email && dateOk;

    function Submit() {
        if (ok) {
            data.current.name = name;
            data.current.birthdate = date;
            data.current.email = email;
            handleNext();
        }
    }

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <ModalMargin>
                <CenterLogo />
                <Typography variant="verybig_bold" sx={{ my: 4 }}>Create account</Typography>
                <NameEditor onChangeName={setName} onChangeOk={setNameOk} />
                <EmailInput
                    sx={{ mb: 4 }}
                    onChange={handleEmail}
                    error={Boolean(emailError)}
                    helperText={emailError}
                    value={email} />
                <EnterBirthDate onChangeDate={setDate} onChangeOk={setDateOk} />
                <WideButton color="black" disabled={!ok} sx={{ mt: "auto", mb: 3 }}
                    onClick={Submit}>Next</WideButton>
            </ModalMargin>
        </Stack>
    );
}

function Page1(props)//checkboxes
{
    const [data, handleNext] = GetProps(props);

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

    function Submit() {
        data.current.checkboxes = [...checkboxes];
        handleNext();
    }

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <Stack direction="column" sx={{ flexGrow: 1 }}>
                <ModalMargin>
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
                </ModalMargin>
            </Stack>
            <BottomButtonWithBorder onClick={Submit} text={"Next"} />
        </Stack>
    );
}

function Page2(props)//rechapta and send values to server
{
    const [data, handleNext] = GetProps(props);
    const [captchaValue, setCaptchaValue] = useState('');

    function handleCaptchaChange(value) {
        setCaptchaValue(value);
    };

    //submit rechapta
    async function submitChapta() {
        try {
            const vals = data.current;
            await axios.post('register_start',
                {
                    email: vals.email,
                    name: vals.name,
                    birthdate: vals.birthdate.toISOString(),
                    recaptchaToken: captchaValue,
                    checkboxes: vals.checkboxes
                },
            );
            //rechapta ok, next page
            handleNext();
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    };

    return (
        <Stack direction="column" spacing={2} sx={{ height: "100%" }}>
            <CenterLogo />
            <RechaptaInput onChange={handleCaptchaChange} />
            <BottomButtonWithBorder onClick={submitChapta} text="Submit" />
        </Stack>
    );
}

function Page3(props)//submit verification code
{
    const [data, handleNext] = GetProps(props);
    const [code, setCode] = useState("");
    const codeOk = code.length > 0;
    const [loading, setLoading] = useState(false);

    function handleCode(e) {
        setCode(e.target.value);
    }

    //submit verification code
    async function submitCode() {
        if (!codeOk)
            return;

        try {
            setLoading(true);
            await axios.post('verify_code',
                {
                    code: code
                },
            );
            setLoading(false);
            //code ok, next page
            handleNext();
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    };


    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <ModalMargin>
                <CenterLogo />
                <Typography variant="verybig_bold" sx={{ mt: 4 }}>We sent you a verification code</Typography>
                <Typography variant="small_fade" sx={{ mt: 3 }}>Enter it to the field below to verify {data.current.email}</Typography>
                <TextField variant="outlined" type="text" label="Verification code" sx={{ my: 3 }}
                    onChange={handleCode}
                    value={code} />
                <WideButton color="black" sx={{ mb: 3, mt: "auto" }}
                    onClick={submitCode} disabled={!codeOk || loading}>Submit</WideButton>
            </ModalMargin>
        </Stack>
    );
}

function Page4(props) {
    const { update } = useContext(UserContext);

    async function onSubmit(password, data, handleNext) {
        try {
            await axios.post('submit_password',
                {
                    password: password
                },
            );
            //code ok, logged in on server, update user on client, this will render the next page
            await update();
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    return <Page4Any onSubmit={onSubmit} {...props} />
}

function Page11(props) {
    async function onSubmit(password, data, handleNext) {
        data.current.password = password;
        handleNext();
    }

    return <Page4Any onSubmit={onSubmit} {...props} />
}

function Page4Any(props)//enter password, and decide what to do after it
{
    const [data, handleNext] = GetProps(props);
    const [password, setPassword] = useState('');
    const [passwordOk, setPasswordOk] = useState();

    async function submitPassword() {
        if (!passwordOk)
            return;

        props.onSubmit(password, data, handleNext);
    }

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <ModalMargin>
                <CenterLogo />
                <Typography variant="verybig_bold" sx={{ mt: 4 }}>You need a password</Typography>
                <Typography variant="small_fade" sx={{ mt: 3 }}>At least 8 characters {data.current.email}</Typography>
                <PasswordInput onChangePassword={setPassword} onChangeOk={setPasswordOk} />
                <ByRegistering variant="small_fade" sx={{ mt: "auto" }} />
                <Typography variant="small_fade">Y can use your contact informations, including your email address and phone number according to the privacy policy. <SmallLink to="/privacy_policy">See more</SmallLink></Typography>
                <WideButton color="black" sx={{ my: 3 }}
                    onClick={submitPassword} disabled={!passwordOk}>Next</WideButton>
            </ModalMargin>
        </Stack>
    );
}

function Page5(props)//upload profile picture
{
    const [data, handleNext] = GetProps(props);
    const [file, setFile] = useState();
    const [uploading, setUploading] = useState(false);

    async function submitImage() {
        if (file !== undefined) {
            const formData = new FormData();
            formData.append('image', file);
            try {
                setUploading(true);
                await axios.post(
                    '/member/modify/update_profile_picture',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                setUploading(false);
                handleNext();
            }
            catch (err) {
                ThrowIfNotAxios(err);
            }
        }
        else
            handleNext();
    }

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <ModalMargin>
                <CenterLogo />
                <Typography variant="verybig_bold" sx={{ mt: 4 }}>Select profile picture!</Typography>
                <Typography variant="small_fade" sx={{ mt: 3 }}>Do you have a favourite selfie? Upload now!</Typography>
                <div style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <ProfilePicEditor size="200px" onUploadFile={setFile} />
                </div>
                <Box sx={{ my: 3, boxSizing: "border-box" }}>
                    {file ?
                        <WideButton color="black" onClick={submitImage} disabled={uploading}>
                            Submit
                        </WideButton>
                        :
                        <OutlinedButton onClick={handleNext}>
                            Skip
                        </OutlinedButton>
                    }
                </Box>
            </ModalMargin>
        </Stack>
    );
}

function Page6(props)//enter username
{
    const [data, handleNext] = GetProps(props);

    const [username, setUserName] = useState("");
    const [usernameOk, setUserNameOk] = useState(false);

    async function submitUsername() {
        if (!usernameOk)
            return;

        try {
            await axios.post("member/modify/change_username", {
                username: username
            });
            handleNext();
        } catch (err) { ThrowIfNotAxios(err); }
    }

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <ModalMargin>
                <CenterLogo />
                <Typography variant="verybig_bold" sx={{ mt: 4 }}>How should we call you?</Typography>
                <Typography variant="small_fade" sx={{ mt: 3 }}>The @username is unique. You can modify it anytime.</Typography>
                <UserNameEditor onChangeUserName={setUserName} onChangeOk={setUserNameOk} />
                <WideButton color="black" sx={{ mb: 3, mt: "auto" }}
                    onClick={submitUsername} disabled={!usernameOk}>Next</WideButton>
            </ModalMargin>
        </Stack>
    );
}

function Page7(props)//notifications
{
    const [data, handleNext] = GetProps(props);
    async function setNotifications(enabled) {
        try {
            await Ask();
            await axios.post("member/modify/change_browser_notifications", {
                enabled: enabled
            });
            handleNext();
        } catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    return (
        <Stack direction="column" sx={{ height: "100%", justifyContent: "center" }}>
            <ModalMargin>
                <Typography variant="verybig_bold">Enable notifications?</Typography>
                <Typography variant="small_fade" sx={{ mt: 1, mb: 3 }}>Bring out the most of Y and stay up-to-date about the events.</Typography>
                <WideButton color="black" sx={{ mb: 2, boxSizing: "border-box" }} onClick={() => { setNotifications(true) }}>Enable</WideButton>
                <OutlinedButton onClick={handleNext}>Not now</OutlinedButton>
            </ModalMargin>
        </Stack>
    );
}

function Page8(props)//follow
{
    const [data, handleNext] = GetProps(props);
    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <Stack direction="column" sx={{ flexGrow: 1, overflow: "hidden" }}>
                <CenterLogo />
                <div style={{ flexGrow: 1, maxHeight: "100%", overflowY: "scroll" }}>
                    <RecommendCelebrities />
                </div>
            </Stack>
            <BottomButtonWithBorder onClick={handleNext} text={"Next"} />
        </Stack>
    );
}

function Page9(props)//only date of birth
{
    const [data, handleNext] = GetProps(props);
    const [date, setDate] = useState();
    const [dateOk, setDateOk] = useState(false);

    function Submit() {
        if (dateOk) {
            data.current.birthdate = date;
            handleNext();
        }
    }

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <ModalMargin>
                <CenterLogo />
                <EnterBirthDate onChangeDate={setDate} onChangeOk={setDateOk} />
                <WideButton color="black" disabled={!dateOk} sx={{ mt: "auto", mb: 3 }}
                    onClick={Submit}>Next</WideButton>
            </ModalMargin>
        </Stack>
    );
}

function Page10(props)//only name
{
    const [data, handleNext] = GetProps(props);
    const [name, setName] = useState("");
    const [nameOk, setNameOk] = useState(false);

    function Submit() {
        if (nameOk) {
            data.current.name = name;
            handleNext();
        }
    }

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <ModalMargin>
                <CenterLogo />
                <Typography variant="verybig_bold" sx={{ my: 4 }}>Sign-up to Y!</Typography>
                <Typography variant="small_fade" sx={{ mb: 3 }}>Only a username and a password is needed. Email address is not necessary for the sake of privacy.</Typography>
                <NameEditor onChangeName={setName} onChangeOk={setNameOk} />
                <ByRegistering variant="small_fade" sx={{ mt: "auto" }} />
                <WideButton color="black" disabled={!nameOk} sx={{ mt: 3, mb: 3 }}
                    onClick={Submit}>Next</WideButton>
            </ModalMargin>
        </Stack>
    );
}



function RecommendCelebrities() {
    return (
        <WhoToFollow noMore />
    );
}

function EnterBirthDate(props) {
    return (
        <>
            <Typography variant="medium_bold" sx={{ mb: 2 }}>Date of birth</Typography>
            <Typography variant="medium_fade" sx={{ mb: 2 }}>This will not be publicly visible. Verify your own age, even if it's a business account, a pet account, or something else.</Typography>
            <BirthDateEditor {...props} />
        </>
    );
}

function GetProps(props) {
    const data = props.dataRef;
    const handleNext = props.handleNext;
    return [data, handleNext];
}

export default CreateAccount;

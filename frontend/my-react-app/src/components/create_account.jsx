import { Box, Icon, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Fab from '@mui/material/Fab';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import Moment from "moment";
import 'moment/locale/de';
import React, { memo, useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import validator from "validator";
import { ThrowIfNotAxios } from "/src/communication.js";
import { CornerButton, OutlinedButton, WideButton } from "/src/components/buttons.jsx";
import config from "/src/components/config.js";
import { PasswordFieldWithToggle, VisuallyHiddenInput } from "/src/components/inputs";
import { fileToMedia } from '/src/components/media';
import { Modals } from "/src/components/modals";
import { BigModal, BottomButtonWithBorder, ByRegistering, ModalMargin ,SmallLink} from "/src/components/no_user";
import { UserData } from "/src/components/user_data";
import { AvatarImageDisplayer, CenterLogo, GetProfilePicture } from '/src/components/utilities';
import { UserListExtended } from "/src/pages/follow_people";
import Ask from "/src/components/web_push.js";

function CreateAccount(props) {
    //only the selected pages are rendered
    const pages = props.pages ? props.pages : [0];

    //the values of the pages that is not sent to the server directly on submit (like email,birthdate)
    const dataRef = useRef({});

    //step handler
    const [stepIndex, setStep] = useState(0);//the stepindex must be cleared via key when another createaccount is rendered 
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
        try {
            const data=dataRef.current;
            await axios.post("finish_registration",
                {
                    birthdate: data.birthdate.toISOString(),
                    checkboxes: data.checkboxes
                });
            close();
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
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
        Page9
    ];
    const RenderPage = pageRenderers[pageIndex];

    //render the chosen page
    return (
        <BigModal close={props.close} open={true}>
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

    function handleCode(e) {
        setCode(e.target.value);
    }

    //submit verification code
    async function submitCode() {
        if (!codeOk)
            return;

        try {
            await axios.post('verify_code',
                {
                    code: code
                },
            );
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
                    onClick={submitCode} disabled={!codeOk}>Submit</WideButton>
            </ModalMargin>
        </Stack>
    );
}

function Page4(props)//enter password, login
{
    const [data, handleNext] = GetProps(props);
    const [password, setPassword] = useState('');
    const [passwordOk, setPasswordOk] = useState();

    async function submitPassword() {
        if (!passwordOk)
            return;

        try {
            await axios.post('submit_password',
                {
                    password: password
                },
            );
            //code ok, logged in on server, update user on client, this will render the next page
            await UserData.update();
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
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
    const [uploading,setUploading]=useState(false);

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
                <WideButton color="black" sx={{ my: 3 }}
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
        }  catch (err) {
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
            <Stack direction="column" sx={{ flexGrow: 1 }}>
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

function PasswordInput(props) {
    const [password, setPassword] = useState(props.value ? props.value : "");
    const [passwordError, setPasswordError] = useState(false);
    const onChangePassword = props.onChangePassword;
    const onChangeOk = props.onChangeOk;

    function handlePassword(e) {
        const value = e.target.value;
        setPassword(value);
        const error = value.length >= 8 ? undefined : "Must be at least 8 characters";
        setPasswordError(error);

        if (onChangePassword)
            onChangePassword(value);
        if (onChangeOk)
            onChangeOk(!Boolean(error));
    };

    return (
        <PasswordFieldWithToggle variant="outlined" label="Password" sx={{ my: 3 }}
            error={Boolean(passwordError)}
            helperText={passwordError}
            onChange={handlePassword}
            value={password} />
    );
}

function EmailInput(props) {
    return (
        <TextField autoComplete="email" variant="outlined" type="email" label="Email"
            {...props} />
    );
}

function validateEmail(email) {
    //must be validated with the same function on the server
    return validator.isEmail(email);
};

function RechaptaInput(props) {
    return (
        <Stack style={{ alignItems: "center", flexGrow: 1 }}>
            <ReCAPTCHA
                sitekey="6Ld-x7wpAAAAAI72weXOfrlCY4hmIZ_b1F9FWFik"
                {...props}
            />
        </Stack>
    );
}

function RecommendCelebrities() {
    const url = "/member/general/celebrities";
    return (
        <UserListExtended url={url} />
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

function WaitAfterChange(cb, timerRef,wait=300) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
        cb();
    }, wait);
}

const ProfilePicEditor = memo(({user,size : overwriteSize,onUploadFile})=> {
    const size = overwriteSize ? overwriteSize : "100px";
    const current=user?GetProfilePicture(user):undefined;

    function ProfileDisplayer({ media, button }) {
        return (
            <div style={{ position: "relative", width: "fit-content" }}>
                <AvatarImageDisplayer media={media} style={{ height: size, width: size }} />
                {button}
            </div>
        );
    }

    return (
        <ChangeablePicture displayer={ProfileDisplayer} current={current} onUploadFile={onUploadFile} />
    );
},
(prev,now)=>prev.user===now.user);

function ChangeablePicture(props) {
    const [file, setFile] = useState();
    const mediaRef = useRef(props.current);
    const media = mediaRef.current;
    const onUploadFile = props.onUploadFile;//only runs when the user uploads a new image, it does nothing in start, unlike the other similar onchange functions

    useEffect(() => {
        if (onUploadFile)
            onUploadFile(file);
    }, [file]);

    function handleFile(e) {
        const selected = e.target.files[0];
        if (selected === undefined)
            mediaRef.current = undefined;
        else {
            const myMedia = fileToMedia(selected);
            mediaRef.current = myMedia;
        }
        setFile(selected);
    }


    const Displayer = props.displayer;

    function ChangeButton() {
        return (
            <Fab size="small" color="transparentBlack" sx={{ border: 1, borderColor: "divider", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <VisuallyHiddenInput type="file" accept={config.accepted_image_types} onChange={handleFile} onClick={(e)=>e.stopPropagation()}/>
                <Icon baseClassName="material-icons-outlined">
                    add_a_photo
                </Icon>
            </Fab>
        );
    }

    return (
        <Displayer
            button={<ChangeButton />}
            media={media} />
    );
}

function UserNameEditor(props) {
    const [username, setUserName] = useState("");
    const [usernameOk, setUserNameOk] = useState(false);
    const changedUserName = props.onChangeUserName;
    const changedOk = props.onChangeOk;
    const timerRef = useRef();

    useEffect(() => {
        if (changedOk)
            changedOk(usernameOk);
        if (changedUserName)
            changedUserName(username);
    }, [username, usernameOk]);

    function handleUsername(e) {
        const value = e.target.value;
        setUserName(value);
        checkUsername(value);
    }
    function checkUsername(value) {
        setUserNameOk(false);
        WaitAfterChange(async () => {
            if (value.length > 0) {
                try {
                    const res = await axios.post("member/modify/ok_username", {
                        username: value
                    });
                    setUserNameOk(res.data);
                }
                 catch (err) {
                ThrowIfNotAxios(err);
            }
            }
        }, timerRef);
    }
    useEffect(() => {//add the existing username to the textfield on creation
        let starting_username;
        try {
            starting_username = UserData.getData.user.username;
        } catch {
            starting_username = "";
        }
        setUserName(starting_username);
        checkUsername(starting_username);
    }, []);

    return (
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
    );
}

function NameEditor(props) {
    const [name, setName] = useState(props.current !== undefined ? props.current : "");
    const [nameError, setNameError] = useState('');
    const onChangeName = props.onChangeName;
    const onChangeOk = props.onChangeOk;

    useEffect(() => {
        if (onChangeName)
            onChangeName(name);
        if (onChangeOk)
            onChangeOk(!nameError);
    }, [name, nameError]);

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

    return (
        <TextField autoComplete="name" variant="outlined" type="text" label="Name" inputProps={{ maxLength: "50" }} sx={{ mb: 3 }}
            onChange={handleName}
            error={Boolean(nameError)}
            helperText={nameError}
            value={name} />
    );
}

function BirthDateEditor(props) {
    const startingValue = props.current ? new Moment(props.current) : new Moment();
    const [date, setDate] = useState(startingValue);
    const [dateOk, setDateOk] = useState(validateDate(startingValue));
    const onChangeDate = props.onChangeDate;
    const onChangeOk = props.onChangeOk;

    useEffect(() => {
        if (onChangeDate)
            onChangeDate(date);
        if (onChangeOk)
            onChangeOk(dateOk);
    }, [date, dateOk]);

    function handleDate(date) {
        setDate(date);
        setDateOk(validateDate(date));
    }

    function validateDate(myDate) {
        return myDate.isValid() && !myDate.isAfter() && myDate.year() >= 1900;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker label="Date of birth" disableFuture onChange={handleDate} value={date} />
        </LocalizationProvider>
    );
}

export default CreateAccount;
export { BirthDateEditor, ChangeablePicture, EmailInput, NameEditor, PasswordInput, ProfilePicEditor, RechaptaInput, UserNameEditor, validateEmail };

import { Box, Typography } from '@mui/material';
import Icon from "@mui/material/Icon";
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import React, { useCallback, useContext, useRef, useState } from "react";
import { ThrowIfNotAxios } from "/src/communication.js";
import { CornerButton, OutlinedButton, WideButton } from "/src/components/buttons.jsx";
import { EmailInput, RechaptaInput, validateEmail } from "/src/components/create_account";
import { PasswordFieldWithToggle } from "/src/components/inputs";
import { ErrorText, Modals, SuccessModal } from "/src/components/modals";
import { AlternativeLogin, BigModal, BigModalMargin, BottomButtonWithBorder, Or, SmallLink } from "/src/components/no_user";
import { UserContext } from "/src/components/user_data";
import { CenterLogo } from '/src/components/utilities';
import { LoginLink } from '/src/components/login_redirects/google';

function Login(props) {
    //shared data
    const dataRef = useRef({});

    //pages
    const pages = {
        main: ChooseMethod,
        password: EnterPassword,
        forgot: ForgotPassword,
        emailless: EmaillessLogin
    }
    const [page, setPage] = useState("main");

    function handleBack() {
        if (page === "main")
            Close()
        else
            setPage("main");
    }

    const CurrentPage = pages[page];

    return (
        <BigModal close={props.close} open={true}>
            <CornerButton onClick={handleBack}>{page === "main" ? "close" : "arrow_back"}</CornerButton>
            <CurrentPage dataRef={dataRef} setPage={setPage} />
        </BigModal>
    );
}

function EnterPassword(props) {
    const dataRef = props.dataRef;
    const email = dataRef.current.email;
    const { update } = useContext(UserContext);

    //password
    const [password, setPassword] = useState("");
    function handlePassword(e) {
        const value = e.target.value;
        setPassword(value);
    }
    async function submitPassword() {
        try {
            await axios.post('login',
                {
                    email: email,
                    password: password
                },
            );
            await update();
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
                <SmallLink onClick={() => { props.setPage("forgot"); }} style={{ cursor: "pointer" }}>Forgot password?</SmallLink>
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
            const res = await axios.post('user/exists/email',
                {
                    email: email
                },
            );
            if (res.data)
                props.setPage("password");
            else
                ErrorText("No Y user belongs to this email");
        } catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <BigModalMargin>
                <CenterLogo />
                <Typography variant="verybig_bold" sx={{ my: 4 }}>Sign-in to Y!</Typography>

                <Stack direction="column" spacing={2}>
                    <LoginLink><AlternativeLogin icon={<img src="/svg/google.svg" style={{ height: "1.5em" }} />} text="Sign-in with Google" /></LoginLink>
                    <AlternativeLogin icon={<Icon>visibility_off</Icon>} text="Sign-in without email" onClick={() => { props.setPage("emailless"); }} />
                    {/*<a href={config.address_mode.server + "/auth/github"}><AlternativeLogin src="/svg/github.svg" text="Sign-in with Github" /></a>*/}
                    <Stack direction="row" sx={{ my: 0.5, alignItems: "center" }}>
                        <Or />
                    </Stack>
                    <TextField autoComplete="email" variant="outlined" type="email" label="Email" onChange={handleEmail} value={email} />
                    <WideButton onClick={submitEmail} size="small" color="black">Next</WideButton>
                    <OutlinedButton onClick={() => { props.setPage("forgot"); }} size="small">Forgot password?</OutlinedButton>
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
            await axios.post('user/change_password/submit_chapta',
                {
                    email: email,
                    recaptchaToken: captchaValue
                },
            );
            //rechapta ok, email sent, show modal
            Modals[0].Show(
                <SuccessModal title={"We sent you an email."} />
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
        <Typography variant="small_fade">You have no account? <SmallLink style={{ cursor: "pointer" }} onClick={Close}>Register</SmallLink></Typography>
    );
}

function EmaillessLogin() {
    const { update } = useContext(UserContext);

    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    const handleUsername=useCallback(e=>{setUsername(e.target.value)});
    const handlePassword=useCallback(e=>{setPassword(e.target.value)});

    async function submit() {
        await axios.post("/username/login", {
            username,
            password
        });
        update();
        Close();
    }

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <BigModalMargin>
                <CenterLogo />
                <Typography variant="verybig_bold" sx={{ my: 4 }}>Sign-in</Typography>
                <Stack direction="column" spacing={2} style={{ flexGrow: 1 }}>
                    <Typography variant="small_fade">Enter the @username and password of your account</Typography>
                    <TextField autoComplete="username" variant="outlined" type="text" label="Username" onChange={handleUsername} value={username} />
                    <PasswordFieldWithToggle variant="outlined" label="Password" sx={{ my: 3 }}
                        onChange={handlePassword}
                        value={password} />
                    <WideButton onClick={submit} size="small" color="black" style={{ marginTop: "auto" }}>Login</WideButton>
                    <Box sx={{ mt: 3 }}>
                        <NoAccount />
                    </Box>
                </Stack>

            </BigModalMargin>
        </Stack>
    );

}

export default Login;
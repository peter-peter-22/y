import { Box, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import React from "react";
import { Route, Routes } from "react-router-dom";
import { OutlinedButton, WideButton } from "/src/components/buttons.jsx";
import config from "/src/components/config.js";
import CreateAccount from "/src/components/create_account.jsx";
import links from "/src/components/footer_links";
import Login from "/src/components/login.jsx";
import { Modals } from "/src/components/modals";
import { StyledLink, TextRow, creation, logo, AboveBreakpoint } from '/src/components/utilities';
import Error from "/src/pages/error";
import { LoginLink } from '/src/components/login_redirects/google';

function Main() {
    const wide = AboveBreakpoint("md");

    function showCreator()//show local registration inputs
    {
        Modals[0].Show(<CreateAccount pages={[0, 1, 2, 3, 4]} key="local" />);
    }

    function showLogin() {
        Modals[0].Show(<Login />)
    }

    return (
        <Stack direction="column" style={{ height: "100vh" }}>
            <Stack direction={wide ? "row" : "column"} style={{ justifyContent: "space-evenly", alignItems: "center", flexGrow: 1 }}>
                <img src={logo} style={{ height: wide ? "350px" : "70px" }} />
                <Stack direction="column">
                    <Typography variant={wide ? "h2" : "h4"} fontWeight="bold" sx={{ my: wide ? 5 : 2.5 }}>
                        Happening now
                    </Typography>
                    <Typography variant={wide ? "h4" : "h6"} fontWeight="bold" sx={{ mb: wide ? 3 : 1.5 }}>
                        Join today.
                    </Typography>
                    <Stack direction="column" spacing={1} style={{ width: "300px" }}>
                        <LoginLink><AlternativeLogin src="/svg/google.svg" text="Sign-up with Google" /></LoginLink>
                        {/*<a href={config.address_mode.server+"/auth/github"}><AlternativeLogin src="/svg/github.svg" text="Sign-up with Github" /></a>*/}
                        <Stack direction="row" sx={{ my: 0.5, alignItems: "center" }}>
                            <Or />
                        </Stack>
                        <WideButton size="medium" color="primary" onClick={showCreator}>
                            Create account
                        </WideButton>
                        <ByRegistering variant="verysmall_fade" />
                        <Typography variant="medium_bold" sx={{ pt: wide ? 5 : 2.5 }}>Do you already have an account?</Typography>
                        <OutlinedButton size="medium" onClick={showLogin}>
                            <Typography variant="medium_bold" color="primary" >Sign-in</Typography>
                        </OutlinedButton>
                    </Stack>
                </Stack>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ my: 2, mx: 5, justifyContent: "center", flexWrap: "wrap" }}>
                {links.map((link, i) => <link.GetElement key={i} />)}
                <div>
                    <Typography variant="small_fade">{creation}</Typography>
                </div>
            </Stack>
        </Stack>
    );
}

export default () => {
    return (
        <Routes>
            <Route path="/" element={<Main />} />
            <Route path="*" element={<Error />} />
        </Routes>
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
        <Box style={{ width: 600, maxWidth: "100%", height: 650 }}>
            {props.children}
        </Box>
    );
}

function SmallLink(props) {
    return (
        <StyledLink typography="very_small" color="primary" {...props}>{props.children}</StyledLink>
    );
}

function ByRegistering(props) {
    return (
        <Typography {...props}>By registering you accept our <SmallLink to="/privacy_policy">End-user agreement</SmallLink> and <SmallLink to="/privacy_policy">Cookie policy</SmallLink> including <SmallLink to="/privacy_policy">Privacy policy</SmallLink></Typography>
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
        <ModalInner style={{ width: 350 }}>
            {props.children}
        </ModalInner>
    );
}

function BigModalMargin(props) {
    return (
        <ModalInner style={{ width: 350, margin: "0 auto" }}>
            {props.children}
        </ModalInner>
    );
}

function ModalInner({ style, children }) {
    return (
        <Box sx={{ px: 1 }} style={{ boxSizing: "border-box", display: "inherit", flexDirection: "inherit", height: "inherit", justifyContent: "inherit", alignItems: "inherit", gap: "inherit", maxWidth: "100%", margin: "0 auto", ...style }}>
            {children}
        </Box>
    );
}


export { AlternativeLogin, BigModal, BigModalMargin, BottomButtonWithBorder, ByRegistering, GrowingLine, ModalMargin, Or, SmallLink };


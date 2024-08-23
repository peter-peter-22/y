import { Box, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import React from "react";
import { OutlinedButton, WideButton } from "/src/components/buttons.jsx";
import config from "/src/components/config.js";
import CreateAccount from "/src/components/create_account.jsx";
import links from "/src/components/footer_links";
import Login from "/src/components/login.jsx";
import { Modals } from "/src/components/modals";
import { StyledLink, TextRow, creation, logo } from '/src/components/utilities';

export default () => {
    function showCreator()//show local registration inputs
    {
        Modals[0].Show(<CreateAccount pages={[0, 1, 2, 3, 4]} key="local" />);
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
                            <a href={config.address_mode.server+"/auth/google"}><AlternativeLogin src="/svg/google.svg" text="Sign-up with Google" /></a>
                            <a href={config.address_mode.server+"/auth/github"}><AlternativeLogin src="/svg/github.svg" text="Sign-up with Github" /></a>
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
                    {links.map((link, i) => <link.GetElement key={i} />)}
                    <div>
                        <Typography variant="small_fade">{creation}</Typography>
                    </div>
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

function SmallLink(props)
{
    return(
        <StyledLink typography="very_small" color ="primary" {...props}>{props.children}</StyledLink>
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
        <Box sx={{ px: props.mx, boxSizing: "border-box", display: "inherit", flexDirection: "inherit", height: "inherit", justifyContent: "inherit", alignItems: "inherit", gap: "inherit" }}>
            {props.children}
        </Box>
    );
}


export { AlternativeLogin, BigModal, BigModalMargin, BottomButtonWithBorder, ByRegistering, GrowingLine, ModalMargin, Or,SmallLink };

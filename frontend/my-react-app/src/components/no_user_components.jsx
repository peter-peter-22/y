import { Box, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import React from "react";
import { OutlinedButton, WideButton } from "/src/components/buttons.jsx";
import { StyledLink } from '/src/components/utilities';

function AlternativeLogin({ icon, size, text, ...props }) {
    return (
        <OutlinedButton {...props} size={size ? size : "medium"}>
            <Stack direction="row" spacing={0.5} style={{ height: "100%", alignItems: "center" }}>
                {icon}
                <span>{text}</span>
            </Stack>
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


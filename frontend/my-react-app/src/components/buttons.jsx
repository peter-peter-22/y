import React from 'react';
import { NavLink } from "react-router-dom";
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ChooseChildBool, ProfileText } from '/src/components/utilities';


const smallerButtons = "leftMenu";
const iconSize = "30px";

function TabButton(props) {
    return (
        <NavLink to={props.to}>
            {({ isActive }) => (
                <ResponsiveButton selected={isActive} override={props.override} text={props.text}>{props.children}</ResponsiveButton>
            )}
        </NavLink>
    );
}

function SelectableButton(props) {
    return (
        <Fab variant="extended" color="secondary_noBg" sx={{
            paddingLeft: "8px",
            paddingRight: "25px"
        }}>
            <ChooseChildBool first={!props.selected}>
                {props.children}
            </ChooseChildBool>
            <span style={{
                marginLeft: "10px"
            }} >
                <Typography variant={props.selected ? "big_title" : "big_body"}>{props.text}</Typography>
            </span>
        </Fab>
    );
}

function SelectableIcon(props) {
    return (
        <Fab size="medium" color="secondary_noBg" >
            <ChooseChildBool first={!props.selected}>
                {props.children}
            </ChooseChildBool>
        </Fab>
    );
}

function ResponsiveButton(props) {
    return (
        <ResponsiveSelector override={props.override} breakpoint={smallerButtons}>
            <SelectableButton selected={props.selected} text={props.text} >{props.children}</SelectableButton>
            <SelectableIcon selected={props.selected} >{props.children}</SelectableIcon>
        </ResponsiveSelector>);
}

function ButtonIcon(props) {
    return (
        <Icon
            baseClassName={props.filled ? "material-icons" : "material-icons-outlined"}
            sx={{ fontSize: iconSize, fontWeight: props.useWeight ? "bold" : "initial" }}
        >
            {props.icon}
        </Icon>
    );
}

function ButtonSvg(props) {
    return (
        <Icon sx={{ fontSize: iconSize }}>
            <img src={props.src} style={{ height: "100%" }} />
        </Icon>
    );
}


function PostButton() {
    return (
        <ResponsiveSelector breakpoint={smallerButtons}>
            <Fab variant="extended" color="primary" sx={{
                width: "100%"
            }}>
                <Typography variant="big_title">Post</Typography>
            </Fab>
            <Fab size="medium" color="primary">
                <ButtonIcon icon="create" filled="true" />
            </Fab>
        </ResponsiveSelector>
    );
}


function ProfileButton() {
    const size = "60px";
    return (
        <ResponsiveSelector breakpoint={smallerButtons}>

            <Fab variant="extended" color="secondary_noBg" sx={{ height: size, borderRadius: size, width: "100%", p: 1 }}>
                <Stack direction="row" spacing={1} sx={{ width: "100%", height: "100%", alignItems: "center" }}>
                    <Avatar src="/src/images/example profile.jpg" />
                    <ProfileText />
                    <Icon>
                        more_horiz
                    </Icon>
                </Stack>
            </Fab>

            <Fab color="secondary" sx={{ height: size, width: size, borderRadius: "100%", p: 0 }}>
                <Avatar src="/src/images/example profile.jpg" />
            </Fab>

        </ResponsiveSelector>
    );
}

export { TabButton, PostButton, ButtonSvg, ButtonIcon, ProfileButton, ResponsiveButton, SelectableButton, SelectableIcon };
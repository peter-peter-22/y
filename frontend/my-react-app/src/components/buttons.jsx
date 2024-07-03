import React, { forwardRef } from 'react';
import { NavLink } from "react-router-dom";
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText, ToCorner, GetUserKey, noOverflow, GetProfilePicture, SimplePopOver, AvatarImageDisplayer, ProfilePic,LinelessLink } from '/src/components/utilities';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import axios from "axios";
import { Endpoint } from "/src/communication.js";
import { UserData } from '/src/App';
import { ImageDisplayer } from "/src/components/media.jsx";
import { Modals } from "/src/components/modals";
import { PostModalFrame } from "/src/components/posts";
import { PostCreator } from '/src/components/post_creator';
import { ThrowIfNotAxios } from "/src/communication.js";
import {BlueTextButton} from "/src/components/containers";

const smallerButtons = "leftMenuIcons";
const iconSize = "30px";

const TabButton = forwardRef((props, ref) => {
    return (
        <NavLink to={props.to} ref={ref} >
            {({ isActive }) => (
                <ResponsiveButton selected={isActive} {...props}>{props.children}</ResponsiveButton>
            )}
        </NavLink>
    );
});

function BottomTabButton(props) {
    return (
        <NavLink to={props.to}>
            {({ isActive }) => (
                <SelectableIcon selected={isActive} size={"small"} {...props} />
            )}
        </NavLink>
    );
}

function SelectableButton({ selected, active_icon, inactive_icon, children, onClick }) {
    return (
        <Fab variant="extended" color="secondary_noBg" sx={{
            paddingLeft: "8px",
            paddingRight: "25px"
        }}
            onClick={onClick}
        >
            {selected ?
                active_icon
                :
                inactive_icon
            }
            <span style={{
                marginLeft: "10px"
            }} >
                <Typography variant="big" fontWeight={selected ? "bold" : "normal"}>{children}</Typography>
            </span>
        </Fab>
    );
}

function TopMenuButton(props) {
    return (
        <ListItemButton onClick={props.onClick} sx={{ p: 0, height: "100%" }}>
            <Box sx={{
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: 'center',
                borderBottom: props.selected ? 4 : 0,
                borderColor: 'primary.main',
                m: "auto"
            }}>
                <Typography variant={props.selected ? "medium_bold" : "medium"} sx={{ p: 0 }}>
                    {props.children}
                </Typography>
            </Box>
        </ListItemButton >
    );
}

function SelectableIcon({ size = "medium", active_icon, inactive_icon, selected, onClick }) {
    return (
        <Fab size={size} color="secondary_noBg" onClick={onClick}>
            {selected ?
                active_icon :
                inactive_icon
            }
        </Fab>
    );
}

function ResponsiveButton({ children, ...props }) {
    const full = <SelectableButton {...props}>{children}</SelectableButton>;
    const iconOnly = <SelectableIcon  {...props}>{children}</SelectableIcon>;

    if (children !== undefined)//if no children(text) then always return only the icon
        return (
            <ResponsiveSelector breakpoint={smallerButtons}
                above={full}
                below={iconOnly}
            />);
    else
        return iconOnly;
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


function PostButton(props) {
    function handlePost() {
        Modals[0].Show(
            <PostModalFrame>
                <PostCreator onPost={posted} />
            </PostModalFrame>
        );
    }
    function posted() {
        Modals[0].Close();
    }
    return (
        <ResponsiveSelector breakpoint={smallerButtons}
            above={
                <WideButton color="primary" style={{ flexShrink: 0 }} {...props} onClick={handlePost}>
                    <Typography variant="big_bold" color="primary.contrastText">Post</Typography>
                </WideButton>
            }
            below={
                <Fab size="medium" color="primary" style={{ flexShrink: 0 }} {...props} onClick={handlePost}>
                    <ButtonIcon icon="create" filled="true" />
                </Fab>
            }
        />
    );
}


function ProfileButton() {
    const size = "60px";
    const user = UserData.getData.user;

    const { handleOpen, ShowPopover } = SimplePopOver();

    async function handleLogout() {
        try {
            await axios.get(Endpoint("/logout"));
            UserData.update();
        } catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    return (
        <>
            <ResponsiveSelector breakpoint={smallerButtons}
                above={
                    <Fab onClick={handleOpen} variant="extended" color="secondary_noBg" sx={{ height: size, borderRadius: size, width: "100%", p: 1, flexShrink: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ width: "100%", height: "100%", alignItems: "center" }}>
                            <ProfilePic user={user} />
                            <ProfileText user={user} />
                            <Icon fontSize="small">
                                more_horiz
                            </Icon>
                        </Stack>
                    </Fab>
                }
                below={
                    <Fab onClick={handleOpen} color="secondary_noBg" sx={{ height: size, width: size, borderRadius: "100%", p: 0, flexShrink: 0 }}>
                        <ProfilePic user={user} />
                    </Fab>
                }
            />

            <ShowPopover>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                            <Typography variant="medium_bold" sx={{ maxWidth: "70vw" }} style={noOverflow}>
                                Logout <GetUserKey user={user} />
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                </List>
            </ShowPopover>
        </>
    );
}

function CornerButton(props) {
    return (
        <ToCorner {...props}>
            <IconButton size="small" onClick={props.onClick}>
                <Icon fontSize="small">{props.children}</Icon>
            </IconButton>
        </ToCorner>);
}

function OutlinedButton(props) {
    return (
        <WideButton color="secondary_noBg" {...props} sx={{ border: 1, borderColor: "divider", ...props.sx }}>
            {props.children}
        </WideButton>
    );
}

function OutlinedFab(props) {
    return (
        <Fab color="secondary_noBg" {...props} sx={{ border: 1, borderColor: "divider", ...props.sx }}>
            {props.children}
        </Fab>
    );
}

function WideButton({ style, ...props }) {
    return (
        <Fab variant="extended" {...props} style={{ width: "100%", ...style }}>
            {props.children}
        </Fab>
    );
}

function LinkButton({to,children}) {
    return (
        <LinelessLink to={to}>
            <BlueTextButton>
                {children}
            </BlueTextButton>
        </LinelessLink>
    );
}

function BlueCenterButton(props) {
    return (
        <Typography variant="medium" color="primary" sx={{ textAlign: "center", cursor: "pointer", "&:hover": { textDecoration: "underline" } }} {...props}>
            {props.children}
        </Typography>
    );
}

export { TabButton, PostButton, ButtonSvg, ButtonIcon, ProfileButton, ResponsiveButton, SelectableButton, SelectableIcon, TopMenuButton, CornerButton, OutlinedButton, WideButton, OutlinedFab, BottomTabButton,LinkButton,BlueCenterButton };
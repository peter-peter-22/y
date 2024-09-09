import { Box, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import React, { useEffect, useState } from 'react';
import { Link, NavLink } from "react-router-dom";
import { TopMenuButton } from "/src/components/buttons.jsx";
import { theme } from '/src/styles/mui/my_theme.jsx';

const noOverflow = {
    whiteSpace: 'nowrap',
    overflow: "hidden",
    textOverflow: 'ellipsis',
    display: "block"
};

const logo = "/svg/y.svg";

const creation = "© 2024 Y Corp.";

function ResponsiveSelector(props) {
    let isAbove = AboveBreakpoint(props.breakpoint);
    if (isAbove)
        return props.above;
    else
        return props.below;
}

function AboveBreakpoint(breakpoint) {
    const myValue = theme.breakpoints.values[breakpoint];
    return AboveValue(myValue);
}
function AboveValue(value) {
    const [isAbove, setAbove] = useState(calAbove());

    function calAbove() {
        const width = window.innerWidth;
        return width > value;
    }

    function handleResize() {
        setAbove(calAbove());
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return isAbove;
}


function TopMenu(props) {
    return (
        <div style={{
            position: "sticky",
            top: 0,
            zIndex: 1051
        }}>
            {props.children}
        </div>
    );
}

function NavMenu({ children, style }) {
    return (
        <div style={{ height: "50px", ...style }}>
            {children}
        </div>
    );
}

function ProfileText(props) {
    return (
        <div style={{ flexGrow: 1, overflow: "hidden" }}>
            <Stack direction={props.row ? "row" : "column"} spacing={props.row ? 0.5 : 0}>
                {props.link ?
                    <UserLink user={props.user} />
                    :
                    <UserName user={props.user} />
                }
                <UserKey user={props.user} />
            </Stack>
        </div>
    );
}

function UserName(props) {
    return (
        <Typography variant="small_bold" align="left" style={noOverflow}>
            <GetUserName user={props.user} />
        </Typography>
    );
}

function UserLink(props) {
    return (
        <StyledLink typography="small_bold" to={GetProfileLink(props.user)} parentStyle={noOverflow} >
            <GetUserName user={props.user} />
        </StyledLink>
    );
}

function UserKeyLink(props) {
    return (
        <StyledLink typography="small_fade" to={GetProfileLink(props.user)} parentStyle={noOverflow} >
            <GetUserKey user={props.user} />
        </StyledLink>
    );
}

function GetProfileLink(user) {
    return "/profile/" + (user ? user.id : -1);
}

function GetUserName(props) {
    return props.user ? props.user.name : "name";
}
function GetUserKey(props) {
    return props.user ? "@" + props.user.username : "@username";
}

function UserKey(props) {
    return (
        <Typography variant="small_fade" align="left" fontWeight="normal" style={noOverflow} >
            <GetUserKey user={props.user} />
        </Typography>
    );
}


function FadeLink(props) {
    return (
        <StyledLink typography="small_fade" {...props}>{props.children}</StyledLink>
    );
}

function BoldLink(props) {
    return (
        <StyledLink typography="small_bold" {...props}>{props.children}</StyledLink>
    );
}

function TabSwitcherLinks(props) {
    return (
        <NavMenu>
            <NavMenuButtonContainer>
                {props.tabs.map((tab, index) => {
                    return (
                        <NavLink to={tab.link} key={index} style={{ textDecoration: "none", height: "100%", flexGrow: 1 }} end>
                            {({ isActive }) => (
                                <TopMenuButton
                                    selected={isActive} >
                                    {tab.text}
                                </TopMenuButton>)}
                        </NavLink>
                    );
                })}
            </NavMenuButtonContainer>
        </NavMenu>
    );
}

function NavMenuButtonContainer(props) {
    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', height: "100%", width: "100%", display: "flex", alignItems: "center", flexDirection: "row" }}>
            {props.children}
        </Box>
    );
}

function TextRow({ children, ...props }) {
    return (
        <Stack direction="row" spacing={0.5} sx={{ overflow: "hidden", alignItems: "baseline", m: 0 }} {...props}>
            {children}
        </Stack>
    );
}

function ReplyingFromPost({ post }) {
    return (
        <ReplyingTo user={post.replied_user} link={"/posts/" + post.replying_to} />
    );
}

function ReplyingToUser({ user }) {
    return (
        <ReplyingTo user={user} link={GetProfileLink(user)} />
    );
}

function ReplyingTo({ user, link }) {
    return (
        <TextRow >
            <Typography variant="small_fade" style={{ flexShrink: 0, ...noOverflow, margin: 0 }}>Replying to</Typography>
            <StyledLink to={link} typography="small_fade">
                <GetUserKey user={user} />
            </StyledLink>
        </TextRow>
    );
}

function StyledLink({ to, children, parentStyle, typography, ...props }) {
    return (
        <Link to={to} style={{ textDecoration: "none", ...parentStyle }} onClick={(e) => { e.stopPropagation() }} >
            <Typography variant={typography} sx={{ "&:hover": { textDecoration: "underline" } }} {...props}>
                {children}
            </Typography>
        </Link>
    );
}

function InheritLink({ to, style, children, onClick, ...props }) {
    return (
        <Link to={to} style={{ textDecoration: "inherit", color: "inherit", fontFamily: "inherit", ...style }}
            onClick={(e) => {
                e.stopPropagation();
                if (onClick)
                    onClick(e)
            }}>
            {children}
        </Link>
    );
}


function ToCorner(props) {
    const offset = "10px";
    const style = { position: "absolute" };
    if (props.right)
        style.right = offset;
    else
        style.left = offset;
    if (props.down)
        style.down = offset;
    else
        style.top = offset;
    return (<div size="small" style={style}>
        {props.children}
    </div>);
}

function CenterLogo() {
    return (
        <img src={logo} style={{ height: "30px", marginTop: "10px" }} />
    );
}



function LinelessLink({ to, children }) {
    return (
        <Link to={to} style={{ textDecoration: "none" }}>
            {children}
        </Link>
    );
}

function Loading() {
    return (
        <div style={{ display: "flex", justifyContent: "center", margin: "10px 0px" }}>
            <CircularProgress size={20} />
        </div>
    );
}

function SimplePopOver() {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (e) => {
        if (e)
            e.stopPropagation();
        setAnchorEl(null);
    };

    function ShowPopover(props) {
        return (
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                onClick={(e) => e.stopPropagation()}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {props.children}
            </Popover>
        );
    };

    return {
        handleOpen: handleOpen,
        handleClose: handleClose,
        ShowPopover: ShowPopover
    };
}

function formatNumber(number) {
    const units = [
        [1000000000, "B"],
        [1000000, "M"],
        [1000, "k"],
    ]

    for (let n = 0; n < units.length; n++) {
        const unit = units[n];
        const [multiplier, name] = unit;
        if (multiplier <= number) {
            const divided = Math.round(number / multiplier);
            return divided + name;
        }
    }
    return number;
}

function ListTitle(props) {
    return (
        <Typography variant="big_bold" sx={{ my: 2, mx: 2 }} style={{ whiteSpace: "nowrap", ...noOverflow }}>
            {props.children}
        </Typography>
    );
}

export { AboveBreakpoint, BoldLink, CenterLogo, creation, FadeLink, formatNumber, GetProfileLink, GetUserKey, GetUserName, InheritLink, LinelessLink, ListTitle, Loading, logo, NavMenu, noOverflow, ProfileText, ReplyingFromPost as ReplyingFrom, ReplyingToUser as ReplyingTo, ResponsiveSelector, SimplePopOver, StyledLink, TabSwitcherLinks, TextRow, ToCorner, TopMenu, UserKey, UserKeyLink, UserLink, UserName };


import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { theme } from '/src/styles/mui/my_theme.jsx';
import Stack from '@mui/material/Stack';
import SideMenu, { Inside } from "/src/components/side_menus.jsx";
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton } from "/src/components/buttons.jsx";
import Moment from "moment";
import { Endpoint, FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import { UserData } from "/src/App.jsx";
import { Error, Modals } from "/src/components/modals";
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import config from "/src/components/config.js";
import { NavLink } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import Popover from '@mui/material/Popover';
import { ExampleUser } from "/src/components/posts";

const noOverflow = {
    whiteSpace: 'nowrap',
    overflow: "hidden",
    textOverflow: 'ellipsis',
    display: "block"
};

const logo = "/svg/y.svg";

const creation = "© 2024 Y Corp.";

const default_profile = "/images/default_profile.jpg";

const default_image = "/images/example profile copy.jpg";

function ResponsiveSelector(props) {
    let isBig = props.override === undefined ? AboveBreakpoint(props.breakpoint) : props.override;
    return (<ChooseChildBool first={isBig}>{props.children}</ChooseChildBool>);
}

function AboveBreakpoint(breakpoint) {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return screenWidth > theme.breakpoints.values[breakpoint];
}


function ChooseChild(props) {
    if (props.children.length !== undefined) {
        let chosenChild = props.children.length > props.index ? props.index : 0;
        return props.children[chosenChild];
    }
    else {
        return props.children;
    }
}

function TopMenu(props) {
    return (
        <div style={{ position: "static" }}>
            <NavMenu>
                {props.children}
            </NavMenu>
        </div>);
}

function NavMenu(props) {
    return (
        <div style={{ height: "40px" }}>
            {props.children}
        </div>);
}

function ChooseChildBool(props) {
    return (<ChooseChild index={props.first ? 0 : 1}>{props.children}</ChooseChild>);
}

function ProfileText(props) {
    return (
        <div style={{ flexGrow: 1, overflow: "hidden" }}>
            <Stack direction={props.row ? "row" : "column"} spacing={props.row ? 0.5 : 0}>
                {props.link ? <UserLink user={props.user} /> : <UserName user={props.user} />}
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
        <StyledNavlink typography="small_bold" to={GetProfileLink(props.user)} style={noOverflow} >
            <GetUserName user={props.user} />
        </StyledNavlink>
    );
}

function UserKeyLink(props) {
    return (
        <StyledNavlink typography="small_fade" to={GetProfileLink(props.user)} style={noOverflow} >
            <GetUserKey user={props.user} />
        </StyledNavlink>
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
        <StyledNavlink typography="small_fade" {...props}>{props.children}</StyledNavlink>
    );
}

function BoldLink(props) {
    return (
        <StyledNavlink typography="small_bold" {...props}>{props.children}</StyledNavlink>
    );
}

function TabSwitcher(props) {
    const [getTab, setTab] = React.useState(0);

    function SelectTab(tabIndex) {
        setTab(tabIndex);
    }

    const selectedTab = props.tabs[getTab];

    return (
        <>
            <TopMenu>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', height: "100%", width: "100%", display: "flex", alignItems: "center", flexDirection: "row" }}>
                    {props.tabs.map((tab, index) => {
                        return (
                            <TopMenuButton
                                selected={getTab === index}
                                onClick={() => {
                                    SelectTab(index);
                                }}
                                key={index}>
                                {tab.text}
                            </TopMenuButton>);
                    })}
                    {props.children}
                </Box>
            </TopMenu>
            {selectedTab.contents}
        </>
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

function DateLink(props) {
    const moment = Moment(new Date(props.isoString));
    const hover = moment.format('h:mm a [·] MM DD YYYY');
    let display;
    if (props.passed) {
        const passed = Moment.duration(Moment().diff(moment));
        if (passed.asSeconds() < 60)
            display = Math.round(passed.asSeconds()) + "s";
        else if (passed.asMinutes() < 60)
            display = Math.round(passed.asMinutes()) + "m";
        else if (passed.asHours() < 24)
            display = Math.round(passed.asHours()) + "h";
        else if (passed.asDays() < 7)
            display = Math.round(passed.asDays()) + "d";
        else display = moment.format('MMM DD');
    }
    else
        display = hover;

    return (
        <Tooltip title={hover}>
            <div>
                <FadeLink style={{ flexShrink: 0, ...noOverflow }}>
                    {display}
                </FadeLink>
            </div>
        </Tooltip>
    );
}

function TextRow(props) {
    return (
        <Stack direction="row" spacing={0.5} style={{ overflow: "hidden", alignItems: "center", margin: 0 }}>
            {props.children}
        </Stack>
    );
}

function ReplyingFrom(props) {
    const post = props.post;
    return (
        <TextRow >
            <Typography variant="small_fade" style={{ flexShrink: 0, ...noOverflow, margin: 0 }}>Replying to</Typography>
            <StyledNavlink to={"/posts/" + post.replying_to} typography="small_fade">
                <GetUserKey user={post.replied_user} />
            </StyledNavlink>
        </TextRow>
    );
}

function ReplyingTo(props) {
    const user = props.post.publisher;
    return (
        <TextRow >
            <Typography variant="small_fade" style={{ flexShrink: 0, ...noOverflow, margin: 0 }}>Replying to</Typography>
            <StyledNavlink to={"/posts/" + user.id} typography="small_fade">
                <GetUserKey user={user} />
            </StyledNavlink>
        </TextRow>
    );
}

function StyledNavlink(props) {
    return (
        <NavLink to={props.to} style={{ textDecoration: "none", ...noOverflow }} onClick={(e) => { e.stopPropagation() }}>
            <Typography variant={props.typography} sx={{ "&:hover": { textDecoration: "underline" } }} {...props}>
                {props.children}
            </Typography>
        </NavLink>
    );
}

function InheritNavLink(props) {
    return (
        <NavLink to={props.to} style={{ textDecoration: "inherit", color: "inherit", fontFamily: "inherit" }} onClick={(e) => { e.stopPropagation() }}>
            {props.children}
        </NavLink>
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


function FollowDialog(props) {
    return (
        <ListItem disablePadding>
            <ListItemButton>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", width: "100%" }}>
                    <Avatar />
                    <ProfileText user={props.user} />
                    <FollowButton user={props.user} />
                </Stack>
            </ListItemButton>
        </ListItem>
    );
}

function FollowButton(props) {
    const [following, setFollowing, toggleFollow] = ToggleFollow(props.user);

    return (
        <Fab onClick={toggleFollow} variant="extended" size="small" color="black" sx={{ flexShrink: 0 }}>{following ? "Following" : "Follow"}</Fab>
    );
}

function ToggleFollow(user) {
    return ToggleOnlineBool(user, "/member/general/follow_user", user.is_followed);
}
function ToggleBlock(user) {
    return ToggleOnlineBool(user, "/member/general/block_user", user.is_blocked);
}

function ToggleOnlineBool(user, url, startingValue) {
    const [get, set] = useState(Boolean(startingValue));

    function toggle() {
        set((prev) => {
            const newValue = !prev;
            async function update() {
                try {
                    await axios.post(Endpoint(url),
                        {
                            key: user.id,
                            value: newValue
                        }
                    )
                }
                catch (err) {
                    ThrowIfNotAxios(err);
                }
            }
            update();
            return newValue;
        });
    }

    return [get, set, toggle];
}


function GetProfilePicture(user, isUser) {
    return GetAnyProfileImage(user, config.profile_pics_url, isUser);
}
function GetProfileBanner(user, isUser) {
    return GetAnyProfileImage(user, config.profile_banner_url, isUser);
}
function GetAnyProfileImage(user, baseUrl, isUser) {
    let url = user ? Endpoint(baseUrl + "/" + user.id + ".jpg") : default_image;//the default image is overridden by the onerror function of the image, this is just secondary
    if (isUser)
        url += "?" + UserData.getData.user.last_update;//updatecount grows by 1 each time the user is downloaded from the server, this updates the profile picture or banner when the user changes it
    return (url);
}

function GetPostPictures(post_id, image_count) {
    const images = [];
    for (let n = 0; n < image_count; n++)
        images.push(Endpoint(config.post_pics_url + "/" + post_id + "_" + n + ".jpg"))
    return images;
}

function LinelessLink(props) {
    return (
        <Link href={props.href} style={{ textDecoration: "none" }}>
            {props.children}
        </Link>
    );
}

const OnlineList = forwardRef((props, ref) => {
    const [entries, setEntries] = useState([]);
    const listRef = useRef(null);
    const savedScrollRef = useRef(0);
    const [end, setEnd] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const updateRef = useRef({ end, downloading });
    useEffect(() => { updateRef.current = { end, downloading } }, [end, downloading]);

    //the minimum distance between the bottom of the screen and the bottom of the list in px.
    const minUnseenHeight = 2000;

    //add an entry from outside
    useImperativeHandle(ref, () => ({
        AddEntryToTop(newEntry) {
            setEntries((prev) => [newEntry, ...prev]);
        }
    }));

    //check the new height after render, adjust the scrolling
    useEffect(() => {
        if (savedScrollRef.current !== undefined) {
            window.scrollTo(0, savedScrollRef.current);
            savedScrollRef.current = undefined;
        }
        Scrolling();
    }, [entries])

    async function FillEntries() {
        const from = entries.length;
        const results = await GetEntries(from);
        //if no results recieved, then this is the end of the list, do not ask for more entries
        if (results.length === 0) {
            setEnd(true);
            return;
        }
        else {
            setEntries((prev) => {
                return prev.concat(results)
            });
            //the scolling would stuck at the bottom when the page is expanded by the new posts,
            //so the last scroll value before rendering must be saved and loaded after rendering
            savedScrollRef.current = window.scrollY;
        }
        setDownloading(false);
    }

    //download new entries when needed
    useEffect(() => {
        if (downloading)
            FillEntries();
    }, [downloading])


    function Scrolling() {
        if (!updateRef.current.end && !updateRef.current.downloading) {
            const unseenHeight = listRef.current.getBoundingClientRect().bottom - window.innerHeight;
            if (unseenHeight < minUnseenHeight) {
                setDownloading(true);
            }
        }
    }

    useEffect(() => {
        window.addEventListener("scroll", Scrolling);
        Scrolling();
        return () => { window.removeEventListener("scroll", Scrolling) };
    }, [])

    //getting functions from props
    function EntryMapper(entryprops) {
        return props.entryMapper(entryprops);
    }

    async function GetEntries(from) {
        return await props.getEntries(from);
    }

    function defaultEntryMapController(props) {
        return (
            <List sx={{ p: 0 }}>
                {props.entries.map((entry, index) => <EntryMapper key={index} entry={entry} />)}
            </List>
        );
    }
    const overrideEntryMapController = props.entryMapController;
    const EntryMapController = overrideEntryMapController ? overrideEntryMapController : defaultEntryMapController;

    return (
        <div ref={listRef}>
            <EntryMapController entries={entries} />
            {!end && <Loading />}
        </div>
    );
});

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
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (e) => {
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

export { AboveBreakpoint, ResponsiveSelector, ChooseChild, ChooseChildBool, TopMenu, ProfileText, FadeLink, TabSwitcher, UserName, UserKey, noOverflow, BoldLink, UserLink, UserKeyLink, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, logo, creation, ToCorner, CenterLogo, default_profile, FollowDialog, GetProfilePicture, default_image, FollowButton, GetPostPictures, LinelessLink, OnlineList, Loading, SimplePopOver, formatNumber, TabSwitcherLinks, GetProfileBanner, GetProfileLink, ReplyingFrom, ToggleFollow, ToggleBlock, StyledNavlink,InheritNavLink }
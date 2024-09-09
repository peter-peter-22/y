import { alpha, Box, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import Moment from "moment";
import React, { forwardRef, lazy, memo, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Link, NavLink } from "react-router-dom";
import { ThrowIfNotAxios } from "/src/communication.js";
import { TopMenuButton } from "/src/components/buttons.jsx";
import { Media, MediaDisplayer, MediaFromFileData, mediaTypes } from "/src/components/media.jsx";
import { OpenOnClick } from "/src/components/post_components";
import { ClickableSingleImageContainer } from "/src/components/post_media";
import { UserContext } from "/src/components/user_data";
import { theme } from '/src/styles/mui/my_theme.jsx';

const LeftTabsMobile = lazy(async () => ({
    default: (await import('/src/components/header')).LeftTabsMobile,
}));


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

function TabSwitcher(props) {
    const [getTab, setTab] = React.useState(0);
    const { getData } = useContext(UserContext);
    const [showTabs, setShowTags] = useState(false);

    const hideTabs = AboveBreakpoint("bottomTabs");
    const selectedTab = props.tabs[getTab];

    function SelectTab(tabIndex) {
        setTab(tabIndex);
    }

    const setDrawer = (open) => () => {
        setShowTags(open);
    }

    return (
        <>
            <TopMenu>

                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: alpha(theme.palette.background.default, 0.8),
                    backdropFilter: "blur(5px)"
                }} />

                {!hideTabs &&
                    <NavMenu style={{ position: "relative", display: "flex" }}>
                        <div style={{ height: "100%", width: "100%", position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src={logo} style={{ height: "80%" }} />
                        </div>
                        <ProfilePic user={getData.user} style={{ alignSelf: "center", marginLeft: 5 }} disabled onClick={setDrawer(true)} />
                    </NavMenu>
                }

                <NavMenu>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', height: "100%", width: "100%", display: "flex", alignItems: "center", flexDirection: "row", position: "relative" }}>
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
                </NavMenu>

                <Drawer
                    anchor={"left"}
                    open={showTabs}
                    onClose={setDrawer(false)}
                >
                    <LeftTabsMobile />
                </Drawer>

            </TopMenu>
            <div style={{ position: "relative" }}>
                {selectedTab.contents}
            </div>
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


function FollowDialog({ user, children }) {
    return (
        <ListItem disablePadding>
            <OpenOnClick link={GetProfileLink(user)} style={{ width: "100%" }}>
                <ListItemButton>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", width: "100%" }}>
                        <div>
                            <ProfilePic user={user} />
                        </div>
                        <div style={{ flexGrow: 1, overflow: "hidden" }}>
                            <Stack direction="column" >
                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                    <ProfileText user={user} />
                                    <FollowButton user={user} />
                                </Stack>
                                {children}
                            </Stack>
                        </div>
                    </Stack>
                </ListItemButton>
            </OpenOnClick>
        </ListItem>
    );
}

function FollowButton(props) {
    const [following, setFollowing, toggleFollow] = ToggleFollow(props.user);

    return (
        <Fab onClick={(e) => { e.stopPropagation(); toggleFollow(); }} variant="extended" size="small" color="black" sx={{ flexShrink: 0 }}>{following ? "Following" : "Follow"}</Fab>
    );
}

function ToggleFollow(user) {
    return ToggleOnlineBool(user, "/member/general/follow_user", user.is_followed);
}
function ToggleBlock(user, onChange) {
    return ToggleOnlineBool(user, "/member/general/block_user", user.is_blocked, onChange);
}

function ToggleOnlineBool(user, url, startingValue, onChange) {
    const start = Boolean(startingValue);
    const [get, set] = useState(start);
    const lastValueRef = useRef(start);

    function toggle() {
        set((prev) => {
            const newValue = !prev;
            update(newValue);
            if (onChange)
                onChange(newValue, user);

            return newValue;
        });
    }

    async function update(newValue) {
        //prevent duplicated requiests
        if (newValue === lastValueRef.current)
            return;
        else
            lastValueRef.current = newValue;

        try {
            await axios.post(url,
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

    return [get, set, toggle];
}


function GetProfilePicture(user) {
    return new MediaFromFileData(user.picture);
}
function GetProfileBanner(user) {
    return new MediaFromFileData(user.banner);
}

const ProfilePic = memo(({ user, ...props }) => {
    return (
        <AvatarImageDisplayer media={GetProfilePicture(user)} {...props} />
    );
}, (prevProps, nextProps) => prevProps.user === nextProps.user);

function AvatarImageDisplayer({ media, ...props }) {
    const defa = "/images/default_image.jpg";
    return (
        <Avatar {...props}>
            <ClickableSingleImageContainer
                disabled={props.disabled}
                media={media}
                style={{
                    width: "100%",
                    height: "100%",
                }}>
                <MediaDisplayer
                    media={media}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                    }}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = defa;
                    }}
                    onEmpty={new Media(mediaTypes.image, defa)}
                />
            </ClickableSingleImageContainer>
        </Avatar>
    );
}


//get media jsons from post and convert them to client media object
function GetPostMedia(post) {
    if (!post.media)//media can be null in sql
        return;

    const medias = [];

    for (let n = 0; n < post.media.length; n++) {
        const filedata = post.media[n];
        medias.push(new MediaFromFileData(filedata));
    }

    return medias;
}

function LinelessLink({ to, children }) {
    return (
        <Link to={to} style={{ textDecoration: "none" }}>
            {children}
        </Link>
    );
}

function defaultEntryMapController({ entries, EntryMapper, getKey = defaultGetKey }) {
    return (
        <List style={{ padding: 0 }}>
            {entries.map((entry, index) => <EntryMapper entry={entry} key={getKey(entry, index)} />)}
        </List>
    );
}

function defaultGetKey(entry, index) {
    return index;
}

const OnlineList = forwardRef(({ EntryMapper, getEntries, entryMapController: overrideEntryMapController, getKey }, ref) => {
    const [entries, setEntries] = useState([]);
    const listRef = useRef(null);
    const savedScrollRef = useRef(0);
    const [end, setEnd] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const startTimeRef = useRef(Math.floor(Date.now() / 1000));//the unix timestamp when this list was created. it is used to filter out the contents those were created after the feed
    const updateRef = useRef({ end, downloading, entries });
    useEffect(() => {
        updateRef.current = { end, downloading, entries }
    }, [end, downloading, entries]);

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
        let results = await getEntries(from, startTimeRef.current);
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
        return () => {
            window.removeEventListener("scroll", Scrolling)
        };
    }, [])

    const EntryMapController = overrideEntryMapController ? overrideEntryMapController : defaultEntryMapController;

    return (
        <div ref={listRef}>
            <EntryMapController entries={entries} EntryMapper={EntryMapper} getKey={getKey} />
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

export { AboveBreakpoint, AvatarImageDisplayer, BoldLink, CenterLogo, creation, DateLink, FadeLink, FollowButton, FollowDialog, formatNumber, GetPostMedia, GetProfileBanner, GetProfileLink, GetProfilePicture, GetUserKey, GetUserName, InheritLink, LinelessLink, ListTitle, Loading, logo, NavMenu, noOverflow, OnlineList, ProfilePic, ProfileText, ReplyingFromPost as ReplyingFrom, ReplyingToUser as ReplyingTo, ResponsiveSelector, SimplePopOver, StyledLink, TabSwitcher, TabSwitcherLinks, TextRow, ToCorner, ToggleBlock, ToggleFollow, TopMenu, UserKey, UserKeyLink, UserLink, UserName };


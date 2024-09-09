import { alpha, Box } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import Moment from "moment";

import React, { lazy, memo, useContext, useRef, useState } from 'react';
import { lazily } from 'react-lazily';
import { ThrowIfNotAxios } from "/src/communication.js";
import { TopMenuButton } from "/src/components/buttons.jsx";
import { Media, MediaFromFileData, mediaTypes } from "/src/components/media_components";
import { OpenOnClick } from "/src/components/post_components";
import { ClickableSingleImageContainer } from "/src/components/post_media";
import { UserContext } from "/src/components/user_data";
import { AboveBreakpoint, FadeLink, GetProfileLink, logo, NavMenu, noOverflow, ProfileText, TopMenu } from "/src/components/utilities";
import { theme } from '/src/styles/mui/my_theme.jsx';
const { MediaDisplayer } = lazily(() => import('/src/components/media'));


const LeftTabsMobile = lazy(async () => ({
    default: (await import('/src/components/header')).LeftTabsMobile,
}));

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

const ProfilePic = memo(({ user, ...props }) => {
    return (
        <AvatarImageDisplayer media={GetProfilePicture(user)} {...props} />
    );
}, (prevProps, nextProps) => prevProps.user === nextProps.user);

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

function GetProfilePicture(user) {
    return new MediaFromFileData(user.picture);
}
function GetProfileBanner(user) {
    return new MediaFromFileData(user.banner);
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

export {
    AvatarImageDisplayer, DateLink, FollowButton,
    FollowDialog, GetPostMedia, GetProfileBanner,
    GetProfilePicture, ProfilePic,
    TabSwitcher, ToggleBlock,
    ToggleFollow
};


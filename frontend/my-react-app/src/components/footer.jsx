import React, { useState, useEffect, useRef, memo } from "react";
import Stack from '@mui/material/Stack';
import { Inside } from "./side_menus.jsx";
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText, FadeLink, creation, FollowDialog, LinelessLink, Loading, AboveBreakpoint, InheritLink, SimplePopOver, NavMenu } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton, LinkButton } from "/src/components/buttons.jsx";
import { UserData } from "/src/components/user_data";
import { NavLink } from "react-router-dom";
import {  FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import axios, { AxiosError } from 'axios';
import links from "/src/components/footer_links";
import Trends from "/src/components/trends";

function Footer() {
    const visible = AboveBreakpoint("hideRightMenu");
    if (!visible)
        return;

    return (
        <TwoSidedSticky>
            <Contents />
        </TwoSidedSticky>
    );
}

function TwoSidedSticky({ children }) {
    const ref = useRef();
    const scrollPrevRef = useRef(0);
    const scrollingDownRef = useRef(false);
    const [scrollingDown, setScrollingDown] = useState(false);
    const [offset, setOffset] = useState(0);//the height of the empty space above the sticky div

    //the threshold where the sticky div will start following the screen.
    //equal to the max overflow height
    const height = ref.current ? ref.current.offsetHeight - window.innerHeight : 0;

    //decide if the sticky div should stick to the op or bottom
    const position = scrollingDown ?
        { top: -height } :
        { bottom: -height };

    //return true if the sticky div will be un-stucked by the current scroll
    function unstuck(scrollDown) {
        const threshold = 1;
        const rect = ref.current.getBoundingClientRect();
        if (scrollDown) {
            //if sticked to the top, and scrolling down, will unstuck
            const reachedTop = Math.abs(rect.top) < threshold;
            return reachedTop;
        }
        else {
            //if sticked to the bottom, and scrolling up, will unstuck
            const reachedBottom = Math.abs(rect.bottom - window.innerHeight) < threshold;
            return reachedBottom;
        }
    }

    //update offset and stick direction on scroll
    useEffect(() => {
        function onScroll() {
            //calculate scroll direction
            const scrollCurrent = window.scrollY;
            const scrollDelta = scrollCurrent - scrollPrevRef.current;
            const scrolledDown = scrollDelta > 0;
            scrollPrevRef.current = scrollCurrent;
            scrollingDownRef.current = scrolledDown;
            setScrollingDown(scrolledDown);

            //when un-stuck, calculate the offset
            const unstucking = unstuck(scrolledDown);
            if (unstucking) {
                //decide the offset height after un-stuck, based on the scrolling direction
                let height = scrollCurrent;
                if (!scrolledDown)
                    height -= (ref.current.offsetHeight - window.innerHeight);

                setOffset(Math.max(height, 0));
            }
        }

        window.addEventListener("scroll", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return (
        <Stack direction="column" >
            <div style={{ height: offset }} />
            <div
                ref={ref}
                style={{
                    position: "sticky",
                    ...position
                }}
            >
                {children}
            </div>
        </Stack>
    );
}

const Contents = memo(() => {
    const wide = AboveBreakpoint("rightMenuSmaller");

    return (
        <Box
            sx={{
                pl: 4,
            }}
            style={{
                width: wide ? "300px" : "220px",
            }}
        >
            <NavMenu>
                <SearchField />
            </NavMenu>
            <Stack direction="column" spacing={2} sx={{ my: 2 }} >

                <Premium />

                <BoxList>
                    <WhoToFollow />
                </BoxList>

                <Trends />

                <Links />

            </Stack>
        </Box>
    );
});

function Links() {
    const linkCount = 4;
    const visibleLinks = links.slice(0, linkCount);
    const hiddenLinks = links.slice(linkCount, links.length);

    const { handleOpen, handleClose, ShowPopover } = SimplePopOver();
    return (
        <>
            <ListItem>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0px 10px" }}>
                    {visibleLinks.map((link, i) => <link.GetElement key={i} />)}
                    <FadeLink onClick={handleOpen}>More ···</FadeLink>
                    <Typography variant="small_fade">{creation}</Typography>
                </div>
            </ListItem>
            <ShowPopover>
                <List>
                    {hiddenLinks.map((link, i) =>
                        <ListItem key={i}>
                            <link.GetElement />
                        </ListItem>
                    )}
                </List>
            </ShowPopover>
        </>
    );
}

function Premium() {
    return (
        <BoxList>

            <ListItem>
                <Typography variant="big_bold">
                    Subscribe to Premium
                </Typography>
            </ListItem>

            <ListItem>
                <Typography variant="small">
                    Subscribe to unlock new features and if eligible, receive a share of ads revenue.
                </Typography>
            </ListItem>

            <ListItem >
                <InheritLink to="/premium">
                    <Fab variant="extended" size="small" color="black">Subscribe</Fab>
                </InheritLink>
            </ListItem>

        </BoxList>
    );
}

function WhoToFollow() {
    const [users, setUsers] = useState();
    useEffect(() => {
        async function getFollowRecommendations() {
            try {
                const res = await axios.get("/member/general/follower_recommendations_preview");
                setUsers(res.data);
            }
            catch (err) {
                ThrowIfNotAxios(err);
            }
        }
        getFollowRecommendations();
    }, []);

    return (
        <List sx={{ p: 0 }}>
            <ListItem>
                <ListItemText>
                    <Typography variant="big_bold">
                        Who to follow
                    </Typography>
                </ListItemText>
            </ListItem>

            {users ? users.map((user, index) => <FollowDialog user={user} key={index} />) : <Loading />}

            <LinkButton to="/add_followers">
                Show more
            </LinkButton>
        </List>
    );
}

export default Footer;
export { WhoToFollow }
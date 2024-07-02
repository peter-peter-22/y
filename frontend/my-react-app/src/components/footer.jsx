import React, { useState, useEffect } from "react";
import Stack from '@mui/material/Stack';
import { Inside } from "./side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText, FadeLink, creation, FollowDialog, LinelessLink, Loading, AboveBreakpoint, InheritLink, SimplePopOver } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton } from "/src/components/buttons.jsx";
import { UserData } from "/src/App.jsx";
import { NavLink } from "react-router-dom";
import { Endpoint, FormatAxiosError ,ThrowIfNotAxios} from "/src/communication.js";
import axios, { AxiosError } from 'axios';
import links from "/src/components/footer_links";
import Trends from "/src/components/trends";

function Footer() {
    const wide = AboveBreakpoint("rightMenuSmaller");
    const visible = AboveBreakpoint("hideRightMenu");
    const width = wide ? "300px" : "220px";
    return (
        <div>
            {visible &&
                <Box sx={{ pl: 4, width: width }}>
                    <TopMenu>
                        <SearchField />
                    </TopMenu>
                    <Stack direction="column" spacing={2} sx={{ my: 2 }} >

                        <Premium />

                        <BoxList>
                            <WhoToFollow />
                        </BoxList>

                        <Trends />

                        <Links />

                    </Stack>
                </Box>
            }
        </div>
    );
}

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
                const res = await axios.get(Endpoint("/member/general/follower_recommendations_preview"));
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

            <LinelessLink to="/add_followers">
                <BlueTextButton>
                    Show more
                </BlueTextButton>
            </LinelessLink>
        </List>
    );
}

export default Footer;
export { WhoToFollow }
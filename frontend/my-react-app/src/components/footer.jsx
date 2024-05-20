import React from "react";
import Stack from '@mui/material/Stack';
import SideMenu, { Inside } from "./side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, creation, FollowDialog, NiceLink } from '/src/components/utilities';
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


function Footer() {
    return (
        <div>
        <SideMenu border="borderLeft">
            <Box sx={{ pl: 4, width: "300px" }}>
                <TopMenu>
                    <SearchField />
                </TopMenu>
                <Stack direction="column" spacing={2} sx={{ my: 2 }} >

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
                            <Fab variant="extended" size="small" color="black">Subscribe</Fab>
                        </ListItem>

                    </BoxList>

                    <BoxList>

                        <ListItem>
                            <ListItemText>
                                <Typography variant="big_bold">
                                    Who to follow
                                </Typography>
                            </ListItemText>
                        </ListItem>

                        <FollowDialog user={UserData.getData.user} />

                        <NiceLink to="/add_followers">
                            <BlueTextButton>
                                Show more
                            </BlueTextButton>
                        </NiceLink>

                    </BoxList>

                    <BoxList>

                        <ListItem>
                            <ListItemText>
                                <Typography variant="big_bold">
                                    Hungary trends
                                </Typography>
                            </ListItemText>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemText>
                                    <Typography variant="small_fade">
                                        <div>
                                            <span>1</span><span style={{ margin: "0px 4px" }}>·</span><span>Trending</span>
                                        </div>
                                    </Typography>
                                    <Typography variant="small_bold">
                                        <div>
                                            #Hungary
                                        </div>
                                    </Typography>
                                    <Typography variant="small_fade">
                                        <div>
                                            999K posts
                                        </div>
                                    </Typography>

                                    <CornerButton>more_horiz</CornerButton>
                                </ListItemText>
                            </ListItemButton>
                        </ListItem>

                        <BlueTextButton>
                            Show more
                        </BlueTextButton>

                    </BoxList>

                    <ListItem>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0px 10px" }}>
                            <FadeLink>Terms of Service</FadeLink>
                            <FadeLink>Privacy Policy</FadeLink>
                            <FadeLink>Cookie Policy</FadeLink>
                            <FadeLink>Accessibility</FadeLink>
                            <FadeLink>Ads Info</FadeLink>
                            <FadeLink>More···</FadeLink>
                            <Typography variant="small_fade">{creation}</Typography>
                        </div>
                    </ListItem>

                </Stack>
            </Box>
        </SideMenu>
        </div>
    );
}

export default Footer;
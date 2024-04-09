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
import { ResponsiveSelector, ChooseChildBool, ProfileText } from '/src/components/utilities';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

function Footer() {
    return (
        <SideMenu border="borderLeft">
            <Box sx={{ pl: 4,width:"270px" }}>
                <TopMenu>
                    <SearchField />
                </TopMenu>
                <Stack direction="column" spacing={2} sx={{ my: 2 }} >
                    <Box sx={{ borderRadius: 2, overflow: "hidden", bgcolor: 'secondary_blue.main' }}>
                        <List sx={{ p: 0 }}>

                            <ListItem>
                                <ListItemText>
                                    <Typography variant="big_title">
                                        Who to follow
                                    </Typography>
                                </ListItemText>
                            </ListItem>

                            <ListItem disablePadding>
                                <ListItemButton>
                                    <Stack direction="row" spacing={1} sx={{alignItems:"center",width:"100%"}}>
                                        <Avatar src="/src/images/example profile.jpg" />
                                        <ProfileText />
                                        <Fab variant="extended" size="small" color="black" sx={{flexShrink:0}}>Follow</Fab>
                                    </Stack>
                                </ListItemButton>
                            </ListItem>

                        </List>
                    </Box>
                </Stack>
            </Box>
        </SideMenu>
    );
}

export default Footer;
import React from "react";
import Stack from '@mui/material/Stack';
import  { Inside } from "./side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';

function BoxList(props) {
    return (
        <Box sx={{ borderRadius: 2, overflow: "hidden", bgcolor: 'secondary_blue.main' }} {...props}>
            <List sx={{ p: 0 }}>
                {props.children}
            </List>
        </Box>
    );
}

function BoxListOutlined(props) {
    return (
        <Box sx={{ borderRadius: 2, overflow: "hidden", borderWidth: "1px", borderColor: 'secondary_blue.dark' }}>
            <List sx={{ p: 0 }}>
                {props.children}
            </List>
        </Box>
    );
}

function BlueTextButton(props) {
    return(
    <ListItemButton>
        <ListItemText>
            <Typography variant="small" color="primary">
                {props.children}
            </Typography>
        </ListItemText>
    </ListItemButton>);
}

export { BoxList, BoxListOutlined,BlueTextButton };
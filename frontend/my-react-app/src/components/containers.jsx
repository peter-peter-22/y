import { Box, Typography } from '@mui/material';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import React from "react";

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

export { BlueTextButton, BoxList, BoxListOutlined };

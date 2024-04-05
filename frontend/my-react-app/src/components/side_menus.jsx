import React from "react";
import { Box } from '@mui/system';

function SideMenu(props) {
    return (
        <Box sx={{ minHeight: "100vh", boxSizing: "border-box", p: 0.5, px: 5, [props.border]: 1, borderColor: 'secondary.dark' }}>
            {props.children}
        </Box>
    );
}

export default SideMenu;
import React from "react";
import { Box } from '@mui/system';

function SideMenu(props) {
    return (
        <Box sx={{ minHeight: "100vh", [props.border]: 1, borderColor: 'secondary.dark' }}>
            {props.children}
        </Box>
    );
}
function Inside(props) {
    return (
        <Box sx={{ p: 0.5, px: 1,height:"100%", boxSizing: "border-box"}}>
            {props.children}
        </Box>
    )
}


export default SideMenu;
export {Inside}

import React from "react";
import { Box } from '@mui/system';

function SideMenu(props) {
    return (
        <Box sx={{height:"100%",width:"100%",  [props.border]: 1, borderColor: 'divider' }}>
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

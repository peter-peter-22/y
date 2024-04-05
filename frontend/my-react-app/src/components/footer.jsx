import React from "react";
import Stack from '@mui/material/Stack';
import SideMenu from "./side_menus.jsx";


function Footer() {
    return (
        <SideMenu border="borderLeft">
            <Stack direction="column" spacing={1} >
Footer
            </Stack>
        </SideMenu>
    );
}

export default Footer;
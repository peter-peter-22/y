import React from "react";
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import { TabButton, PostButton, SvgIcon } from "./buttons.jsx";
import SideMenu from "./side_menus.jsx";
import {  NavLink } from "react-router-dom";
import { theme } from '/src/styles/mui/my_theme.jsx';


function Header() {
    return (

        <SideMenu border="borderRight">
            <Stack direction="column" spacing={1} >

                <NavLink to="/">
                    <Fab size="medium" color="secondary" sx={{
                        backgroundColor: 'transparent',
                        fontSize: theme.typography.h6.fontSize
                    }}>
                        <SvgIcon src="/src/svg/y.svg" />
                    </Fab>
                </NavLink>

                <TabButton to="/" text="home" icon="home_outlined" />
                <TabButton to="/" text="explore" icon="home_outlined" />
                <TabButton to="/" text="notifications" icon="home_outlined" />
                <TabButton to="/" text="messages" icon="home_outlined" />
                <TabButton to="/" text="lists" icon="home_outlined" />
                <TabButton to="/" text="bookmarks" icon="home_outlined" />
                <TabButton to="/" text="communities" icon="home_outlined" />
                <TabButton to="/" text="premium" icon="home_outlined" />
                <TabButton to="/" text="profile" icon="home_outlined" />
                <TabButton to="/" text="more" icon="home_outlined" />

            </Stack>
        </SideMenu>
    );
}

export default Header;
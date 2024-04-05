import React from "react";
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import { TabButton, ButtonIcon, ButtonSvg, PostButton } from "./buttons.jsx";
import SideMenu from "./side_menus.jsx";
import { NavLink } from "react-router-dom";
import { theme } from '/src/styles/mui/my_theme.jsx';


function Header() {
    return (

        <SideMenu border="borderRight">
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                <Stack direction="column" spacing={1} >

                    <NavLink to="/">
                        <Fab size="medium" color="secondary" sx={{
                            backgroundColor: 'transparent',
                            fontSize: theme.typography.h6.fontSize
                        }}>
                            <ButtonSvg src="/src/svg/y.svg" />
                        </Fab>
                    </NavLink>

                    <TabButton to="/" text="home"  >
                        <ButtonIcon icon="home" filled={false} />
                        <ButtonIcon icon="home" filled={true} />
                    </TabButton>

                    <TabButton to="/explore" text="explore" >
                        <ButtonIcon icon="search" filled={false} />
                        <ButtonIcon icon="saved_search" filled={false} />
                    </TabButton>

                    <TabButton to="/notifications" text="notifications"  >
                        <ButtonIcon icon="notifications" filled={false} />
                        <ButtonIcon icon="notifications" filled={true} />
                    </TabButton>

                    <TabButton to="/messages" text="messages"  >
                        <ButtonIcon icon="mail" filled={false} />
                        <ButtonIcon icon="mail" filled={true} />
                    </TabButton>

                    <TabButton to="/lists" text="lists"  >
                        <ButtonIcon icon="list_alt" filled={false} />
                        <ButtonIcon icon="list_alt" filled={true} />
                    </TabButton>

                    <TabButton to="/bookmarks" text="bookmarks"  >
                        <ButtonIcon icon="bookmark_border" filled={false} />
                        <ButtonIcon icon="bookmark" filled={false} />
                    </TabButton>

                    <TabButton to="/communities" text="communities"  >
                        <ButtonIcon icon="people" filled={false} />
                        <ButtonIcon icon="people" filled={true} />
                    </TabButton>

                    <TabButton to="/premium" text="premium">
                        <ButtonSvg src="/src/svg/y.svg" />
                    </TabButton>

                    <TabButton to="/profile" text="profile" icon="home_outlined" >
                        <ButtonIcon icon="person" filled={false} />
                        <ButtonIcon icon="person" filled={true} />
                    </TabButton>

                    <TabButton to="/more" text="more">
                        <ButtonIcon icon="more_horiz" filled={false} />
                    </TabButton>

                    <PostButton />

                </Stack>

                <div style={{marginBottom:"10px"}}>
                    <TabButton to="/more" text="more">
                        <ButtonIcon icon="more_horiz" filled={false} />
                    </TabButton>
                </div>
            </div>
        </SideMenu>
    );
}

export default Header;
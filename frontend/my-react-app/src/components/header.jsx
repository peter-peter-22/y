import React from "react";
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton } from "./buttons.jsx";
import SideMenu,{Inside} from "./side_menus.jsx";
import { ThemeProvider } from '@mui/material';
import { AboveBreakpoint } from './utilities';

function Header() {
    let isBig = AboveBreakpoint("leftMenu");
    return (

        <SideMenu border="borderRight">
            <Inside>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: isBig ? "stretch" : "center", height: "100%", width: isBig ? "250px" : "auto" }}>
                    <Stack direction="column" spacing={1} sx={{ mr: isBig ? 4 : 0 }}>

                            <TabButton link="/" override={false}>
                                <ButtonSvg src="/src/svg/y.svg" />
                            </TabButton>

                            <TabButton to="/" text="home"  >
                                <ButtonIcon icon="home" filled={false} />
                                <ButtonIcon icon="home" filled={true} />
                            </TabButton>

                            <TabButton to="/explore" text="explore" >
                                <ButtonIcon icon="search" />
                                <ButtonIcon icon="search" useWeight={true} />
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
                                <ButtonIcon icon="list_alt" />
                                <ButtonIcon icon="list_alt" useWeight={true} />
                            </TabButton>

                            <TabButton to="/bookmarks" text="bookmarks"  >
                                <ButtonIcon icon="bookmark_border" />
                                <ButtonIcon icon="bookmark" />
                            </TabButton>

                            <TabButton to="/communities" text="communities"  >
                                <ButtonIcon icon="people" filled={false} />
                                <ButtonIcon icon="people" filled={true} />
                            </TabButton>

                            <TabButton to="/premium" text="premium">
                                <ButtonSvg src="/src/svg/y.svg" />
                                <ButtonSvg src="/src/svg/y.svg" useWeight={true} />
                            </TabButton>

                            <TabButton to="/profile" text="profile" icon="home_outlined" >
                                <ButtonIcon icon="person" filled={false} />
                                <ButtonIcon icon="person" filled={true} />
                            </TabButton>

                            <TabButton to="/more" text="more">
                                <ButtonIcon icon="more_horiz" />
                            </TabButton>

                        <PostButton />

                    </Stack>

                    <ProfileButton>
                    </ProfileButton>
                </div>
            </Inside>
        </SideMenu>
    );
}

export default Header;
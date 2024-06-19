import React from "react";
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, BottomTabButton } from "./buttons.jsx";
import { Inside } from "./side_menus.jsx";
import { ThemeProvider } from '@mui/material';
import { AboveBreakpoint, logo } from './utilities';
import { UserData } from "/src/App.jsx";
import { GetProfileLink, NavMenu } from '/src/components/utilities';
import Box from '@mui/material/Box';

function Tab(name, link, active_icon, inactive_icon) {
    this.active_icon = active_icon;
    this.inactive_icon = inactive_icon;
    this.name = name;
    this.link = link;
}

function tabs() {
    return {
        home: new Tab(
            "home",
            "/",
            <ButtonIcon icon="home" filled={true} />,
            <ButtonIcon icon="home" filled={false} />
        ),
        explore: new Tab(
            "explore",
            "/explore",
            <ButtonIcon icon="search" useWeight={true} />,
            <ButtonIcon icon="search" />
        ),
        notif: new Tab(
            "notifications",
            "/notifications",
            <ButtonIcon icon="notifications" filled={true} />,
            <ButtonIcon icon="notifications" filled={false} />
        ),
        messages: new Tab(
            "messages",
            "/messages",
            <ButtonIcon icon="mail" filled={true} />,
            <ButtonIcon icon="mail" filled={false} />
        ),
        lists: new Tab(
            "lists",
            "/lists",
            <ButtonIcon icon="list_alt" useWeight={true} />,
            <ButtonIcon icon="list_alt" />
        ),
        bookmarks: new Tab(
            "bookmarks",
            "/bookmarks",
            <ButtonIcon icon="bookmark" />,
            <ButtonIcon icon="bookmark_border" />
        ),
        comm: new Tab(
            "communities",
            "/communities",
            <ButtonIcon icon="people" filled={true} />,
            <ButtonIcon icon="people" filled={false} />
        ),
        premium: new Tab(
            "premium",
            "/premium",
            <ButtonSvg src={logo} useWeight={true} />,
            <ButtonSvg src={logo} />
        ),
        profile: new Tab(
            "profile",
            GetProfileLink(UserData.getData.user),
            <ButtonIcon icon="person" filled={true} />,
            <ButtonIcon icon="person" filled={false} />
        ),
        more: new Tab(
            "more",
            "/more",
            <ButtonIcon icon="more_horiz" />,
            <ButtonIcon icon="more_horiz" />
        )
    };
}

function Header() {
    const wideButtons = AboveBreakpoint("leftMenuIcons");
    const bigMargins = AboveBreakpoint("smallIconMargins");
    const leftTabs = AboveBreakpoint("bottomTabs");
    const width = wideButtons ? "300px" : bigMargins ? "70px" : "60px";

    function LeftTabs() {
        return (
            <div style={{ width: width, height: "100vh", flexShrink: 0 }}>
                <div style={{ position: "fixed", width: width, height: "100vh" }}>
                    <Inside>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: wideButtons ? "stretch" : "center", height: "100%" }}>
                            <Stack direction="column" spacing={1} sx={{ mr: wideButtons ? 4 : 0 }}>

                                <TabButton to="/"
                                    inactive_icon={<ButtonSvg src={logo} />}
                                    active_icon={<ButtonSvg src={logo} />}
                                />

                                {Object.values(tabs()).map(((tab, index) =>
                                    <TabButton
                                        to={tab.link}
                                        active_icon={tab.active_icon}
                                        inactive_icon={tab.inactive_icon}
                                        key={index}
                                    >
                                        {tab.name}
                                    </TabButton>
                                ))}

                                <PostButton />

                            </Stack>

                            <ProfileButton>
                            </ProfileButton>
                        </div>
                    </Inside>
                </div>
            </div>
        );
    }

    function BottomTabs() {
        const selectedTabs = [
            "home",
            "explore",
            "notif",
            "messages",
            "profile"
        ];
        const myTabs = selectedTabs.map(tab => tabs()[tab]);
        return (
            <Stack direction={"column"} style={{ position: "fixed", bottom: 0, left: 0, width: "100%",zIndex: 2, }}>
                <PostButton sx={{alignSelf:"end",m:2}}/>
                <Box sx={{ py: 1, backgroundColor: "background.default", zIndex: 2, borderTop: 1, borderColor: "divider" }}>
                    <Stack direction={"row"} style={{ width: "100%", justifyContent: "space-around" }}>
                        {myTabs.map((tab, index) =>
                            <BottomTabButton
                                to={tab.link}
                                active_icon={tab.active_icon}
                                inactive_icon={tab.inactive_icon}
                                key={index}
                            />
                        )}
                    </Stack>
                </Box>
            </Stack>
        );
    }

    const ChosenTabs = leftTabs ? LeftTabs : BottomTabs;

    return (
        <ChosenTabs />
    );
}

export default Header;
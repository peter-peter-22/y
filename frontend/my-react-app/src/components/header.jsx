import React, { useEffect, useRef, useState } from "react";
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, BottomTabButton } from "./buttons.jsx";
import { Inside } from "./side_menus.jsx";
import { ThemeProvider } from '@mui/material';
import { AboveBreakpoint, logo, SimplePopOver } from './utilities';
import { UserData } from "/src/App.jsx";
import { GetProfileLink,InheritLink } from '/src/components/utilities';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

function Tab(name, link, active_icon, inactive_icon) {
    this.active_icon = active_icon;
    this.inactive_icon = inactive_icon;
    this.name = name;
    this.link = link;
}

function Header() {
    const tabs = {
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
        )
    };

    const wideButtons = AboveBreakpoint("leftMenuIcons");
    const bigMargins = AboveBreakpoint("smallIconMargins");
    const leftTabs = AboveBreakpoint("bottomTabs");
    const width = wideButtons ? "300px" : bigMargins ? "70px" : "60px";

    function LeftTabs() {
        const spaceRef = useRef();
        const parentRef = useRef();
        const exampleRef = useRef();
        const [tabCount, setTabCount] = useState(0);
        const tabsArray = Object.values(tabs);

        function MoreButton() {
            const { handleOpen,handleClose, ShowPopover } = SimplePopOver();
            return (
                <div>
                    <ResponsiveButton
                        active_icon={<ButtonIcon icon="more_horiz" />}
                        inactive_icon={<ButtonIcon icon="more_horiz" />}
                        onClick={handleOpen}
                        style={{ flexShrink: 0 }}
                    >
                        more
                    </ResponsiveButton>

                    <ShowPopover>
                        <List>
                            {invisibleTabs.map((tab, i) =>
                                <ListItem disablePadding key={i}>
                                    <InheritLink to={tab.link} style={{width:"100%"}} onClick={handleClose}>
                                        <ListItemButton>
                                            <ListItemIcon>
                                                {tab.inactive_icon}
                                            </ListItemIcon>
                                            <ListItemText primary={tab.name} />
                                        </ListItemButton>
                                    </InheritLink>
                                </ListItem>
                            )}
                        </List>
                    </ShowPopover>
                </div>
            );
        }

        function clamp(value, min, max) {
            return Math.max(min, Math.min(value, max));
        }

        useEffect(() => {
            function updateTabs() {
                //check if all elements are defined
                const space = spaceRef.current;
                const example = exampleRef.current;
                const parent = parentRef.current;
                if (!space || !example || !parent)
                    return;

                //get the available space
                let availableSpace;
                availableSpace = space.offsetHeight - parent.offsetHeight;

                //get how much tabs should be added or removed
                const tabHeight = example.offsetHeight + parseFloat(getComputedStyle(parent).gap);
                const changeTabs = Math.floor(availableSpace / tabHeight);

                //apply the change
                setTabCount(prev => clamp(prev + changeTabs, 0, tabsArray.length));
            }
            window.addEventListener("resize", updateTabs);
            updateTabs();

            return () => {
                window.removeEventListener('resize', updateTabs);
                setTabCount(0);
            };
        }, []);

        //split the tabs into 2 groups based on the tabcount
        const visibleTabs = tabsArray.slice(0, tabCount);
        const invisibleTabs = tabsArray.slice(tabCount, tabsArray.length );

        return (
            <div style={{ width: width, height: "100vh", flexShrink: 0 }}>
                <div style={{ position: "fixed", width: width, height: "100vh" }}>
                    <Inside>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: wideButtons ? "stretch" : "center", height: "100%" }}>
                            {/*this div show the maximum available space for the tabs*/}
                            <div style={{ flexGrow: 1, overflow: "hidden" }} ref={spaceRef}>
                                <Stack direction="column" gap={1} ref={parentRef} sx={{ mx: wideButtons ? 4 : 0 }}>
                                    <TabButton to="/"
                                        inactive_icon={<ButtonSvg src={logo} />}
                                        active_icon={<ButtonSvg src={logo} />}
                                        ref={exampleRef}
                                    />

                                    {visibleTabs.map(((tab, index) =>
                                        <TabButton
                                            to={tab.link}
                                            active_icon={tab.active_icon}
                                            inactive_icon={tab.inactive_icon}
                                            {...tab.props}
                                            key={index}
                                        >
                                            {tab.name}
                                        </TabButton>
                                    ))}

                                    <MoreButton />
                                    <PostButton />

                                </Stack>
                            </div>

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
        const myTabs = selectedTabs.map(tab => tabs[tab]);
        return (
            <Stack direction={"column"} style={{ position: "fixed", bottom: 0, left: 0, width: "100%", zIndex: 2, }}>
                <PostButton sx={{ alignSelf: "end", m: 2 }} />
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
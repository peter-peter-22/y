import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import React, { forwardRef, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BottomTabButton, ButtonIcon, ButtonSvg, PostButton, ProfileButton, ResponsiveButton, TabButton } from "./buttons.jsx";
import { Inside } from "./side_menus.jsx";
import { AboveBreakpoint, logo, SimplePopOver } from './utilities';
import { DisplayNotificationCount } from "/src/components/notification_listener";
import { UserContext } from "/src/components/user_data";
import { GetProfileLink, InheritLink } from '/src/components/utilities';

function Tab(name, link, active_icon, inactive_icon, element = BasicTab) {
    this.active_icon = active_icon;
    this.inactive_icon = inactive_icon;
    this.name = name;
    this.link = link;
    this.element = element;
}

function BasicTab({ tab }) {
    return (
        <TabButton
            to={tab.link}
            active_icon={tab.active_icon}
            inactive_icon={tab.inactive_icon}
        >
            {tab.name}
        </TabButton>
    );
}

function NotificationsTab({ tab }) {
    return (
        <DisplayNotificationCount>
            <BasicTab tab={tab} />
        </DisplayNotificationCount>
    );
}

function Tabs() {
    const { getData } = useContext(UserContext);

    const get = () => ({
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
            <ButtonIcon icon="notifications" filled={false} />,
            NotificationsTab
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
            GetProfileLink(getData.user),
            <ButtonIcon icon="person" filled={true} />,
            <ButtonIcon icon="person" filled={false} />
        )
    });

    return useMemo(get, [getData]);
}

function HiddenTabs() {
    const { getData } = useContext(UserContext);

    const get = () => [
        new Tab(
            "settings",
            "/settings",
            <ButtonIcon icon="settings" filled={true} />,
            <ButtonIcon icon="settings" filled={false} />
        )
    ];

    return useMemo(get, [getData]);
}

function MoreButton({ invisibleTabs }) {
    const { handleOpen, handleClose, ShowPopover } = SimplePopOver();
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
                            <InheritLink to={tab.link} style={{ width: "100%" }} onClick={handleClose}>
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

const TopButton = forwardRef((props, ref) => {
    return (
        <TabButton to="/"
            inactive_icon={<ButtonSvg src={logo} />}
            active_icon={<ButtonSvg src={logo} />}
            ref={ref}
        />
    );
});

function Header() {
    const leftTabs = AboveBreakpoint("bottomTabs");

    return (
        leftTabs ? <LeftTabsNormal /> : <BottomTabs />
    );
}

function BottomTabs() {
    const tabs = Tabs();

    const selectedTabs = [
        "home",
        "explore",
        "notif",
        "messages",
        "profile"
    ];
    const myTabs = selectedTabs.map(tab => tabs[tab]);
    return (
        <Stack direction={"column"} style={{ position: "fixed", bottom: 0, left: 0, width: "100%", zIndex: 2, pointerEvents: "none" }}>
            <Box sx={{ alignSelf: "end", m: 2 }} style={{ pointerEvents: "all" }}>
                <PostButton />
            </Box>
            <Box sx={{ py: 1, backgroundColor: "background.default", zIndex: 2, borderTop: 1, borderColor: "divider" }} style={{ pointerEvents: "all" }}>
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

function LeftTabsNormal() {
    return (
        <LeftTabs
            lastTab={<PostButton style={{ marginTop: 10 }} />}
            bottom={<ProfileButton />}
        />
    );
}

function LeftTabsMobile() {
    return (
        <LeftTabs />
    );
}

function LeftTabs({ lastTab, bottom }) {
    const wideButtons = AboveBreakpoint("leftMenuIcons");
    const bigMargins = AboveBreakpoint("smallIconMargins");
    const width = wideButtons ? "270px" : bigMargins ? "70px" : "60px";

    const tabs = Tabs();
    const alwaysHiddenTabs = HiddenTabs();

    const spaceRef = useRef();
    const parentRef = useRef();
    const exampleRef = useRef();
    const [tabCount, setTabCount] = useState(0);
    const tabsArray = Object.values(tabs);

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
    let invisibleTabs = tabsArray.slice(tabCount, tabsArray.length);

    //add the always hidden tabs
    try {
        invisibleTabs = [...invisibleTabs, ...alwaysHiddenTabs];
    }
    catch (err) {
        debugger
        console.log(alwaysHiddenTabs);
    }
    return (
        <div style={{ width: width, height: "100vh", flexShrink: 0 }}>
            <div style={{ position: "fixed", width: width, height: "100vh" }}>
                <Inside>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: wideButtons ? "stretch" : "center", height: "100%" }}>
                        {/*this div show the maximum available space for the tabs*/}
                        <div style={{ flexGrow: 1, overflow: "hidden" }} ref={spaceRef}>
                            <Stack direction="column" gap={2} ref={parentRef} sx={{ mr: wideButtons ? 4 : 0 }}>

                                <TopButton ref={exampleRef} />

                                {visibleTabs.map(((tab, index) =>
                                    <tab.element
                                        tab={tab}
                                        key={index}
                                    />
                                ))}

                                <MoreButton invisibleTabs={invisibleTabs} />
                                {lastTab}

                            </Stack>
                        </div>

                        {bottom}
                    </div>
                </Inside>
            </div>
        </div>
    );
}


export default Header;
export { LeftTabsMobile };


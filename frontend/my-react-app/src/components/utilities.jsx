import React, { useState, useEffect } from 'react';
import { theme } from '/src/styles/mui/my_theme.jsx';
import Stack from '@mui/material/Stack';
import SideMenu, { Inside } from "/src/components/side_menus.jsx";
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton } from "/src/components/buttons.jsx";

const noOverflow = {
    whiteSpace: 'nowrap',
    overflow: "hidden",
    textOverflow: 'ellipsis',
    display: "block"
};

function ResponsiveSelector(props) {
    let isBig = props.override === undefined ? AboveBreakpoint(props.breakpoint) : props.override;
    return (<ChooseChildBool first={isBig}>{props.children}</ChooseChildBool>);
}

function AboveBreakpoint(breakpoint) {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return screenWidth > theme.breakpoints.values[breakpoint];
}


function ChooseChild(props) {
    if (props.children.length !== undefined) {
        let chosenChild = props.children.length > props.index ? props.index : 0;
        return props.children[chosenChild];
    }
    else {
        return props.children;
    }
}

function TopMenu(props) {
    return (
        <div style={{ height: "40px", position: "static" }}>
            {props.children}
        </div>);
}

function ChooseChildBool(props) {
    return (<ChooseChild index={props.first ? 0 : 1}>{props.children}</ChooseChild>);
}

function ProfileText(props) {
    return (
        <div style={{ flexGrow: 1, overflow: "hidden" }}>
            <Stack direction={props.row ? "row" : "column"} spacing={props.row?0.5:0}>
                <Typography variant="small_bold" align="left" style={noOverflow}>
                    Firstname Lastname abc efd efd afsfas sd fsfd
                </Typography>
                <Typography variant="small_fade" align="left" fontWeight="normal" style={noOverflow} >
                    @user_id_5378543678345
                </Typography>
            </Stack>
        </div>
    );
}

function FadeLink(props) {
    return (
        <Link href="#" color="secondary" underline="hover">
            <Typography variant="small">
                {props.children}
            </Typography>
        </Link>
    );
}

function TabSwitcher(props) {
    const [getTab, setTab] = React.useState(props.tabs[0].tabName);

    function SelectTab(tabName) {
        console.log(tabName);
        setTab(tabName);
    }

    const selectedTab = props.tabs.find((tab) => { return tab.tabName === getTab });

    return (
        <>
            <TopMenu>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', height: "100%", width: "100%", display: "flex", alignItems: "center", flexDirection: "row" }}>
                    {props.tabs.map((tab, index) => {
                        return (
                            <TopMenuButton
                                tabIndex={tab.tabName}
                                selected={getTab === tab.tabName ? true : false}
                                onClick={() => {
                                    SelectTab(tab.tabName)
                                }}
                                key={index}>
                                {tab.text}
                            </TopMenuButton>);
                    })}
                    {props.children}
                </Box>
            </TopMenu>
            {selectedTab.contents}
        </>
    );
}

export { AboveBreakpoint, ResponsiveSelector, ChooseChild, ChooseChildBool, TopMenu, ProfileText, FadeLink, TabSwitcher }
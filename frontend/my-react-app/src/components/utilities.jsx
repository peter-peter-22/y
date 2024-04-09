import React, { useState, useEffect } from 'react';
import { theme } from '/src/styles/mui/my_theme.jsx';
import { Typography } from '@mui/material';

const noOverflow = {
    whiteSpace: 'nowrap',
    overflow: "hidden",
    textOverflow: 'ellipsis',
    display: "block",
    textAlign: "start"
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
        <div style={{ height: "40px" }}>
            {props.children}
        </div>);
}

function ChooseChildBool(props) {
    return (<ChooseChild index={props.first ? 0 : 1}>{props.children}</ChooseChild>);
}

function ProfileText() {
    return (
        <div style={{ flexGrow: 1, overflow: "hidden" }}>
            <Typography variant="small_title" style={noOverflow}>
                Firstname Lastname abc efd efd afsfas sd fsfd
            </Typography>
            <Typography variant="small_fade" style={noOverflow} >
                @user_id_5378543678345
            </Typography>
        </div>
    );
}

export { AboveBreakpoint, ResponsiveSelector, ChooseChild, ChooseChildBool, TopMenu,ProfileText }
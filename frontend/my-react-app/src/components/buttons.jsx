import React from "react";
import {  NavLink } from "react-router-dom";
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import { theme } from '/src/styles/mui/my_theme.jsx';


function TabButton(props) {
    return (
        <NavLink to={props.to}>
            {({ isActive }) => (
                <Fab variant="extended" color="secondary" sx={{
                    backgroundColor: 'transparent',
                    fontSize: theme.typography.h6.fontSize,
                    paddingLeft:"8px",
                    paddingRight:"25px"
                }}>
                    <SelectableIcon icon={props.icon} selected={isActive} />
                   <span style={{
                    fontWeight: isActive ? "800" : "inherit", 
                    marginLeft: "5px" 
                    }} >{props.text}</span>
                </Fab>
            )}
        </NavLink>
    );
}

function SelectableIcon(props) {
    return (
        <Icon
            baseClassName={props.selected ? "material-icons" : "material-icons-outlined"}
            sx={{ fontSize: "150%" }}
        >
            {props.icon}
        </Icon>
    );
}

function SvgIcon(props) {
    return (
        <Icon sx={{ fontSize: "150%" }}>
            <img src={props.src} style={{ height: "100%" }} />
        </Icon>
    );
}





function PostButton(props) {
    return (
        <p>coming soon</p>
    );
}

export { TabButton, PostButton, SvgIcon, SelectableIcon };
import React from "react";
import { NavLink } from "react-router-dom";
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
                    paddingLeft: "8px",
                    paddingRight: "25px"
                }}>
                    {props.children && (props.children.length !== undefined ?
                        props.children[(props.children.length > 1 && isActive) ? 1 : 0] :
                        props.children)}
                    <span style={{
                        fontWeight: isActive ? "800" : "inherit",
                        marginLeft: "5px"
                    }} >{props.text}</span>
                </Fab>
            )}
        </NavLink>
    );
}

function ButtonIcon(props) {
    return (
        <Icon
            baseClassName={props.filled ? "material-icons" : "material-icons-outlined"}
            sx={{ fontSize: "150%" }}
        >
            {props.icon}
        </Icon>
    );
}

function ButtonSvg(props) {
    return (
        <Icon sx={{ fontSize: "150%" }}>
            <img src={props.src} style={{ height: "100%" }} />
        </Icon>
    );
}



function PostButton() {
    return (
        <Fab variant="extended" color="primary" sx={{
            padding: "0px 100px",
            fontWeight:"800",
            fontSize: theme.typography.h6.fontSize,
        }}>
            post
        </Fab>
    );
}

export { TabButton, PostButton, ButtonSvg, ButtonIcon };
import React, { useState, useRef, useEffect, forwardRef, memo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Stack from '@mui/material/Stack';
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';


export default () => {
    return (
        <Stack direction="column" style={{ height: "100vh", margin: "auto", alignItems: "center",justifyContent:"center" }}>
            <Icon color="secondary" style={{fontSize:"50px"}}>
                block
            </Icon>
            <Typography color="secondary" variant="medium">Not implemented</Typography>
        </Stack>
    );
};
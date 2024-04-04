import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';

function Header() {
    return (
            <Stack direction="column" spacing={1}  sx={{    height: '100%', borderRight: 1 }}>

                <Link color="secondary" to="/">
                    <Fab variant="extended" color="primary" className="hide-background">
                        <HomeOutlinedIcon sx={{ mr: 1 }} />
                        Extended
                    </Fab>
                </Link>

                <Link to="/test">
                    <Fab variant="extended" color="secondary">
                        <HomeOutlinedIcon sx={{ mr: 1 }} />
                        Extenaaaaaaaaaaaaaaaaaded
                    </Fab>
                </Link>
            </Stack>
    );
}

export default Header;
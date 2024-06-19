import React from "react";
import { Box } from '@mui/system';

function Inside(props) {
    return (
        <Box sx={{ p: 0.5, px: 1,height:"100%", boxSizing: "border-box"}}>
            {props.children}
        </Box>
    )
}

export {Inside}

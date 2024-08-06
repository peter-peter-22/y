import { Icon, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import React from "react";


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
import React, { useState, useRef, useEffect, forwardRef, memo } from "react";
import Stack from '@mui/material/Stack';
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';

function ErrorPage({ text }) {
  return (
    <Stack direction="column" style={{ height: "100vh", margin: "auto", alignItems: "center", justifyContent: "center" }}>
      <Icon color="secondary" style={{ fontSize: "50px" }}>
        block
      </Icon>
      <Typography color="secondary" variant="medium">{text}</Typography>
    </Stack>
  );
}

export default () => {
  return (
    <ErrorPage text={"404 Not found"} />
  );
}

export { ErrorPage };
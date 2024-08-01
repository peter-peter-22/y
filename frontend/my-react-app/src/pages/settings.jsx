import Ask from "/src/components/web_push.js";
import React, { useState, useRef, useEffect, forwardRef, memo } from "react";
import Stack from '@mui/material/Stack';
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import {  FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import axios from 'axios';

export default () => {
  return (
    <Stack direction="column" style={{ height: "100vh", margin: "auto", alignItems: "center", justifyContent: "center" }}>
      <Fab color="black" variant="extended" onClick={Ask}>
        Test
      </Fab>
      <Fab color="black" variant="extended"onClick={()=>{axios.get("send_notification")}}>
        Test
      </Fab>
    </Stack>
  );
}
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React from "react";
import Ask from "/src/components/web_push.js";

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
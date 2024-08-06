import { Icon, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import React from "react";

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

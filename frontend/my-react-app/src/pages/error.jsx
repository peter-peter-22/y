import { Icon, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import React from "react";
import { FormatAxiosError } from "/src/communication.js";

function ErrorPage({ text }) {
  return (
    <InfoPage icon="block" text={text} />
  );
}

function InfoPage({ text, icon }) {
  return (
    <Stack direction="column" style={{ height: "100vh", margin: "auto", alignItems: "center", justifyContent: "center" }}>
      <Icon color="secondary" style={{ fontSize: "50px" }}>
        {icon}
      </Icon>
      <Typography color="secondary" variant="medium">{text}</Typography>
    </Stack>
  );
}

function ErrorPageFormatted({ error }) {
  return (
    <ErrorPage text={FormatAxiosError(error)} />
  );
}
function Successpage({ text }) {
  return (
    <InfoPage icon="done" text={text} />
  );
}

export default () => {
  return (
    <ErrorPage text={"404 Not found"} />
  );
}

export { ErrorPage, ErrorPageFormatted,Successpage };

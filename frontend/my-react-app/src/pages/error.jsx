import { Icon, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import React from "react";
import { FormatAxiosError } from "/src/communication.js";
import { StyledLink } from "/src/components/utilities";

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

function Unauthorized() {
  return (
    <ErrorPage text={
      <div style={{textAlign:"center"}}>
        <div>Unauthorized!</div>
        <Typography color="secondary" variant="small">You must sign-in to visit this page</Typography>
        <StyledLink to="/" color="primary">Sign-in</StyledLink>
      </div>
    } />
  );
}

export default () => {
  return (
    <ErrorPage text={"404 Not found"} />
  );
}

export { ErrorPage, ErrorPageFormatted, Successpage,Unauthorized };

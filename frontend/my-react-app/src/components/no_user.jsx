import React from "react";
import Stack from '@mui/material/Stack';
import SideMenu, { Inside } from "./side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, logo,creation } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton } from "/src/components/buttons.jsx";
import { Grid } from '@mui/material';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { theme } from "/src/styles/mui/my_theme";
import { PlainTextField } from "/src/components/inputs";

export default () => {
    return (
        <Stack direction="column" style={{ height: "100vh" }}>
            <Stack direction="row" style={{ justifyContent: "space-evenly", alignItems: "center", flexGrow: 1 }}>
                <img src={logo} style={{ height: "350px" }} />
                <Stack direction="column">
                    <Typography variant="h2" fontWeight="bold" sx={{ my: 5 }}>
                        Happening now
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                        Join today.
                    </Typography>
                    <Stack direction="column" spacing={1} style={{ width: "300px" }}>
                        <AlternativeLogin src="/src/svg/google.svg" text="Sign-up with Google" />
                        <AlternativeLogin src="/src/svg/google.svg" text="Sign-up with Google" />
                        <Stack direction="row" sx={{ my: 0.5, alignItems: "center" }}>
                            <GrowingLine />
                            <Typography variant="small_fade" sx={{ mx: 1 }}>or</Typography>
                            <GrowingLine />
                        </Stack>
                        <LoginButton color="primary">
                            Create account
                        </LoginButton>
                        <Typography variant="verysmall_fade">By registering you accept our <Link href="#">End-user agreement</Link> and <Link href="#">End-user agreement</Link> including <Link href="#">Privacy policy</Link></Typography>
                        <Typography variant="medium_bold" sx={{ pt: 5 }}>Do you already have an account?</Typography>
                        <OutlinedButton >
                            <Typography variant="medium_bold" color="primary">Sign-in</Typography>
                        </OutlinedButton>
                    </Stack>
                </Stack>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ my: 2, mx: 5,justifyContent:"center" }}>
                <FadeLink href="#">test</FadeLink>
                <FadeLink href="#">test</FadeLink>
                <FadeLink href="#">test</FadeLink>
                <FadeLink href="#">test</FadeLink>
                <FadeLink href="#">test</FadeLink>
                <FadeLink href="#">test</FadeLink>
                <FadeLink href="#">test</FadeLink>
                <FadeLink href="#">test</FadeLink>
                <FadeLink href="#">test</FadeLink>
                <Typography variant="small_fade">{creation}</Typography>
            </Stack>
        </Stack>
    );
}

function AlternativeLogin(props) {
    return (
        <OutlinedButton>
            <TextRow>
                <img src={props.src} style={{ height: "1.5em" }} />
                <span>{props.text}</span>
            </TextRow>
        </OutlinedButton >
    );
}

function OutlinedButton(props) {
    return (
        <LoginButton color="secondary_noBg" sx={{ border: 1, borderColor: "divider" }}>
            {props.children}
        </LoginButton>
    );
}

function LoginButton(props) {
    return (
        <Fab variant="extended" size="medium" {...props} style={{ width: "100%" }}>
            {props.children}
        </Fab>
    );
}

function GrowingLine() {
    return (
        <Divider style={{ flexGrow: 1 }} />
    );
}
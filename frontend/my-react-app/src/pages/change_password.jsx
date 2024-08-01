import React, { useState, useRef, useEffect } from "react";
import Stack from '@mui/material/Stack';
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, logo, creation, CenterLogo, FollowDialog } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton, WideButton, OutlinedButton, OutlinedFab } from "/src/components/buttons.jsx";
import { Grid } from '@mui/material';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { theme } from "/src/styles/mui/my_theme";
import { PlainTextField, PasswordFieldWithToggle, VisuallyHiddenInput } from "/src/components/inputs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import 'moment/locale/de';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import {  FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import { UserData } from "/src/components/user_data";
import { Error, Modals, ErrorText, SuccessModal } from "/src/components/modals";
import { AlternativeLogin, GrowingLine, BigModal, Or, BottomButtonWithBorder, ByRegistering, ModalMargin, BigModalMargin } from "/src/components/no_user";
import { RechaptaInput, validateEmail, EmailInput, PasswordInput } from "/src/components/create_account";
import { Link, useParams, useNavigate } from "react-router-dom";
import Container from '@mui/material/Container';

export default () => {
    const { user_id, secret } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [passwordOk, setPasswordOk] = useState(false);

    async function Submit() {
        try {
            await axios.post("user/change_password/change", {
                user_id: user_id,
                secret: secret,
                password: password
            });
            //success, show a modal and go back to the main page
            Modals[0].Show(<SuccessModal
                title="Password changed"
                text="Now you can sign-in with your new password"
            />);
            navigate("/");
        } catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    return (
        <Container maxWidth="md" sx={{ p: 1, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", width: "1000px", maxWidth: "100%", mx: "auto" }}>
            <BoxList style={{ flexGrow: 1 }}>

                <ListItem>
                    <Typography variant="big_bold">
                        Change password
                    </Typography>
                </ListItem>

                <ListItem>
                    <Typography variant="small">
                        Enter your new password
                    </Typography>
                </ListItem>

                <ListItem>
                    <PasswordInput onChangePassword={setPassword} onChangeOk={setPasswordOk} />
                </ListItem>

                <ListItem >
                    <Stack direction="row" spacing={1} style={{ marginLeft: "auto" }}>
                        <Link to="/">
                            <OutlinedFab variant="extended" size="small">
                                Cancel
                            </OutlinedFab>
                        </Link>
                        <Fab onClick={Submit} variant="extended" size="small" color="black" disabled={!passwordOk}>Change</Fab>
                    </Stack>
                </ListItem>
            </BoxList>
        </Container>
    );
};
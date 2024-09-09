import { Typography } from '@mui/material';
import Container from '@mui/material/Container';
import Fab from '@mui/material/Fab';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ThrowIfNotAxios } from "/src/communication.js";
import { PasswordInput } from "/src/components/account_components";
import { OutlinedFab } from "/src/components/buttons.jsx";
import { BoxList } from '/src/components/containers';
import { Modals, SuccessModal } from "/src/components/modals";

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
import { Typography } from '@mui/material';
import Icon from "@mui/material/Icon";
import Stack from '@mui/material/Stack';
import axios from "axios";
import React,{lazy} from "react";
import { ThrowIfNotAxios } from "/src/communication.js";
import { OutlinedButton, WideButton } from "/src/components/buttons.jsx";
const CreateAccount = lazy(() => import("/src/components/create_account"));
import links from "/src/components/footer_links";
import Login from "/src/components/login.jsx";
import { LoginLink } from '/src/components/login_redirects/google';
import { Modals } from "/src/components/modals";
import { AlternativeLogin, ByRegistering, Or } from "/src/components/no_user_components";
import { AboveBreakpoint, creation, logo } from '/src/components/utilities';
import { Sus } from "/src/components/lazified";

function Main() {
    const wide = AboveBreakpoint("md");

    function showCreator()//show local registration inputs
    {
        Modals[0].Show(<Sus><CreateAccount pages={[0, 1, 2, 3, 4]} key="local" /></Sus>);
    }

    function showUsernameCreator()//show username registration inputs
    {
        Modals[0].Show(<Sus><CreateAccount pages={[10, 11]} key="username" finish={finishUsernameRegistration} /></Sus>);
    }

    function showLogin() {
        Modals[0].Show(<Login />)
    }

    return (
        <Stack direction="column" style={{ height: "100vh" }}>
            <Stack direction={wide ? "row" : "column"} style={{ justifyContent: "space-evenly", alignItems: "center", flexGrow: 1 }}>
                <img src={logo} style={{ height: wide ? "350px" : "70px" }} />
                <Stack direction="column">
                    <Typography variant={wide ? "h2" : "h4"} fontWeight="bold" sx={{ my: wide ? 5 : 2.5 }}>
                        Happening now
                    </Typography>
                    <Typography variant={wide ? "h4" : "h6"} fontWeight="bold" sx={{ mb: wide ? 3 : 1.5 }}>
                        Join today.
                    </Typography>
                    <Stack direction="column" spacing={1} style={{ width: "300px" }}>
                        <LoginLink><AlternativeLogin icon={<img src="/svg/google.svg" style={{ height: "1.5em" }} />} text="Sign-up with Google" /></LoginLink>
                        <AlternativeLogin icon={<Icon>visibility_off</Icon>} text="Register without email" onClick={showUsernameCreator} />
                        {/*<a href={config.address_mode.server+"/auth/github"}><AlternativeLogin src="/svg/github.svg" text="Sign-up with Github" /></a>*/}
                        <Stack direction="row" sx={{ my: 0.5, alignItems: "center" }}>
                            <Or />
                        </Stack>
                        <WideButton size="medium" color="primary" onClick={showCreator}>
                            Create account
                        </WideButton>
                        <ByRegistering variant="verysmall_fade" />
                        <Typography variant="medium_bold" sx={{ pt: wide ? 5 : 2.5 }}>Do you already have an account?</Typography>
                        <OutlinedButton size="medium" onClick={showLogin}>
                            <Typography variant="medium_bold" color="primary" >Sign-in</Typography>
                        </OutlinedButton>
                    </Stack>
                </Stack>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ my: 2, mx: 5, justifyContent: "center", flexWrap: "wrap" }}>
                {links.map((link, i) => <link.GetElement key={i} />)}
                <div>
                    <Typography variant="small_fade">{creation}</Typography>
                </div>
            </Stack>
        </Stack>
    );
}

async function finishUsernameRegistration(data, close, update) {
    try {
        await axios.post("/username/register",
            {
                name: data.name,
                password: data.password
            }
        );
        update();
    }
    catch (err) {
        ThrowIfNotAxios(err);
    }
}

export default Main;


import { Box } from '@mui/material';
import React, { memo, useContext, lazy, Suspense } from "react";
import { Outlet, useMatch } from "react-router-dom";
import Footer from "/src/components/footer";
import LoadingPage from "/src/components/loading.jsx";
import { NotifCountProvider } from "/src/components/notification_listener";
import { UserContext } from "/src/components/user_data";
import { Unauthorized } from "/src/pages/error";
import { Loading } from "/src/components/utilities";
const LoggedOut = lazy(() => import("/src/components/no_user.jsx"));
const Header = lazy(() => import("/src/components/header"));

const AuthTemplate = memo(() => {
    //get user data
    const { getData } = useContext(UserContext);

    return (
        !getData ? <LoadingPage /> :
            !getData.user ? <NoUser /> :
                <div style={{ display: "flex", flexDirection: "row", padding: 0, justifyContent: "center",minHeight:"110vh"}}>
                    <NotifCountProvider>
                        <Header />
                        <Box sx={{ maxWidth: "600px", flexGrow: 1, width: "100%", borderLeft: 1, borderRight: 1, borderColor: "divider", boxSizing: "border-box", minHeight: "100vh" }}>
                            <Suspense fallback={<Loading />}>
                                <Outlet />
                            </Suspense>
                        </Box>
                        <Footer />
                    </NotifCountProvider>
                </div>
    )
}, () => true);

function NoUser() {
    const home = useMatch("/");
    return home ? <LoggedOut /> : <Unauthorized />
}

export default AuthTemplate ;
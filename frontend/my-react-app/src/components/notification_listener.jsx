import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import { useState, useContext, createContext, memo } from "react";
import config from "/src/components/config.js";
import { ListenToStream } from "/src/components/event_stream";

function GetNotificationCount() {
    const [count, setCount] = useState(0);
    ListenToStream(config.address_mode.server + "/member/notifications/events", (data) => {
        setCount(data);
    });
    return [count, setCount];
}

const NotifCountContext = createContext();

function NotifCountProvider({ children }) {
    const [count, setCount] = GetNotificationCount();

    function clear() {
        setCount(0);
    }

    return (
        <NotifCountContext.Provider value={{ count, clear }}>
            <Mem>
                {children}
            </Mem>
        </NotifCountContext.Provider>
    );
}

const Mem = memo(({ children }) => {
    return children;
}, ()=>true);


function DisplayNotificationCount({ children }) {
const {count,clear}=useContext(NotifCountContext);

    return (
        <StyledBadge color="primary" badgeContent={count} max={99} invisible={count == 0} onClick={clear}>
            {children}
        </StyledBadge>
    );
}

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: 35,
        [theme.breakpoints.down('leftMenuIcons')]:
            { right: 15 },
        top: 10,
    },
}));

export { DisplayNotificationCount,NotifCountProvider };

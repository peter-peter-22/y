import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { ThrowIfNotAxios } from "/src/communication.js";
import CreateAccount from "/src/components/create_account.jsx";
import { Modals } from "/src/components/modals";

const UserContext = createContext();

function UserProvider({ children }) {
    const [getData, setData] = useState(null);

    async function Update() {
        try {
            //get user from server
            const response = await axios.get("user/get");
            setData(response.data);
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    useEffect(() => {
            Update();
    }, []);

    useEffect(() => {
        //process the messages

        //after any register 
        if (getData?.showStartMessage) {
            Modals[0].Show(<CreateAccount pages={[5, 6, 7, 8]} key="after" />, CloseStartMessage);

            async function CloseStartMessage() {
                try {
                    await axios.get("member/modify/close_starting_message");
                    await Update();
                }
                catch (err) {
                    ThrowIfNotAxios(err);
                }
            }
        }

        //pending third party registration
        if (getData?.pending_registration) {
            Modals[0].Show(<CreateAccount pages={[1, 9]} finish key="external" />, ExitRegistration);

            async function ExitRegistration() {
                try {
                    await axios.get("exit_registration");
                    await Update();
                }
                catch (err) {
                    ThrowIfNotAxios(err);
                }
            }
        }

    }, [getData]);

    return (
        <UserContext.Provider value={{ getData, setData, update: Update }}>
            {children}
        </UserContext.Provider>
    );
}

export { UserProvider, UserContext };


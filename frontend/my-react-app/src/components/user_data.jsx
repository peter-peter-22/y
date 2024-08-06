import axios from "axios";
import React, { useState } from "react";
import { ThrowIfNotAxios } from "/src/communication.js";
import CreateAccount from "/src/components/create_account.jsx";
import { Modals } from "/src/components/modals";


//globally accessible
let UserData = {};

function UserHook() {
    const [getData, setData] = useState();
    UserData.getData = getData;
    UserData.setData = setData;
    UserData.update = Update;

    React.useEffect(() => {
        Update();//the loading message is visible until it is done
    }, []);

    async function Update() {
        try {

            //get user and messages from server
            const response = await axios.get("user/get");
            setData(response.data);

            //process the messages

            //after any register 
            if (response.data.showStartMessage) {
                Modals[0].Show(<CreateAccount pages={[5, 6, 7, 8]} key="after" />, CloseStartMessage);

                async function CloseStartMessage() {
                    try {
                        await axios.get("member/modify/close_starting_message");
                        UserData.update();
                    }
                    catch (err) {
                        ThrowIfNotAxios(err);
                    }
                }
            }

            //pending third party registration
            if (response.data.pending_registration) {
                Modals[0].Show(<CreateAccount pages={[1, 9]} finish key="external" />, ExitRegistration);

                async function ExitRegistration() {
                    try {
                        await axios.get("exit_registration");
                        UserData.update();
                    }
                    catch (err) {
                        ThrowIfNotAxios(err);
                    }
                }
            }

        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    return getData;
}

export { UserData, UserHook };


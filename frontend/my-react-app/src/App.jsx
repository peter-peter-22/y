//functions and resources
import React, { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import 'material-icons/iconfont/material-icons.css';
import { AboveBreakpoint } from '/src/components/utilities';
import axios from "axios";
import { Endpoint, ThrowIfNotAxios } from "/src/communication.js";
import Dialog from '@mui/material/Dialog';
import CreateAccount from "/src/components/create_account.jsx";
import { Modals, CreateModals, Error } from "/src/components/modals";
import SharedPages from "/src/components/shared_pages_router";

//components
import Main from "./components/logged_in.jsx";
import NoUser from "./components/no_user.jsx";
import Loading from "./components/loading.jsx";

//globally accessible
let UserData = {};

function App() {
  //get user data
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
      const response = await axios.get(Endpoint("/user/get"));
      const user = response.data.user;
      if (user) user.last_update = new Date().getTime();
      setData(response.data);

      //process the messages

      //after any register 
      if (response.data.showStartMessage) {
        Modals[0].Show(<CreateAccount pages={[5, 6, 7, 8]} key="after" />, CloseStartMessage);

        async function CloseStartMessage() {
          try {
            await axios.get(Endpoint("/member/modify/close_starting_message"));
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
            await axios.get(Endpoint("/exit_registration"));
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

  //choose page
  let Page;
  if (getData === undefined) {
    Page = Loading;
  }
  else {
    if (getData.user) {
      Page = Main;
    }
    else {
      Page = NoUser;
    }
  }

  return (
    <Router>
      <CreateModals />
      <div style={{ position: "relative", zIndex: 0 }}>
        <SharedPages>
          <Page />
        </SharedPages>
      </div>
    </Router>
  );
}

export default App
export { UserData }

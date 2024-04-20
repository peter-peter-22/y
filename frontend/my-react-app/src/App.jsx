//functions and resources
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import 'material-icons/iconfont/material-icons.css';
import { AboveBreakpoint } from '/src/components/utilities';
import axios from "axios";
axios.defaults.withCredentials = true
import { Endpoint } from "/src/communication.js";
import Dialog from '@mui/material/Dialog';
import CreateAccount from "/src/components/create_account.jsx";
import { Modals, CreateModals } from "/src/components/modals";

//components
import Main from "./components/logged_in.jsx";
import NoUser from "./components/no_user.jsx";
import Loading from "./components/loading.jsx";

//globally accessable
let UserData = {};

function App() {
  //get user data
  const [getData, setData] = React.useState();
  UserData.getData = getData;
  UserData.setData = setData;
  UserData.update = Update;

  React.useEffect(() => {
    Update();//update is not awaited to show the loading page
  }, []);

  async function Update() {
    try {
      const response = await axios.get(Endpoint("/get_user"));
      setData(response.data);

      //process user data
      if (response.data.showStartMessage) {
        Modals[0].Show(<CreateAccount page={5} />, CloseStartMessage);
      }

      async function CloseStartMessage() {
        try {
          await axios.get(Endpoint("/close_starting_message"));
          UserData.update();
        }
        catch (err) { console.log(err); }
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  //choose page
  let page;
  if (getData === undefined) {
    page = (<Loading />)
  }
  else {
    if (getData.user) {
      page = (<Main />);
    }
    else {
      page = (<NoUser />);
    }
  }

  return (
    <>
      <CreateModals />
      {page}
    </>
  );
}

export default App
export { UserData }

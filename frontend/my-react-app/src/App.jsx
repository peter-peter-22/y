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
import { Endpoint } from "/src/communication.js";
import Dialog from '@mui/material/Dialog';

//components
import Main from "./components/logged_in.jsx";
import NoUser from "./components/no_user.jsx";
import Loading from "./components/loading.jsx";

//functions of the modal, filled by app
let Modal={}; 

function App() {
  //get user data
  const [getData, setData] = React.useState();

  React.useEffect(() => {
    axios.defaults.withCredentials = true
    axios.get(Endpoint("/")).then((response) => {
      setData(response.data);
    }).catch((err) => {
      if (err.response.status === 404)
        console.log("no connection");
      else
        console.log(err);
    });

  }, []);

  //choose page
  let page;
  if (getData === undefined) {
    page=(<Loading />)
  }
  else {
    if (getData.user === 1) {
      page = (<Main />);
    }
    else {
      page = (<NoUser />);
    }
  }

//modal
  const [modal, setModal] = React.useState();
  Modal.Show=setModal;
  function closeModal() {
    setModal(undefined);
  }

  return (
    <>
      {page}

      <Dialog open={Boolean(modal)} onClose={closeModal}>
        {modal}
      </Dialog>
    </>
  )
}

export default App
export {Modal}

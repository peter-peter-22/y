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
import Axios from "axios";
import { Endpoint } from "/src/communication.js";

//components
import Main from "./components/logged_in.jsx";
import NoUser from "./components/no_user.jsx";
import Loading from "./components/loading.jsx";

function App() {
  const [getData, setData] = React.useState();

  React.useEffect(() => {
    Axios.get(Endpoint("/")).then((response) => {
      setData(response.data);
      console.log(response.data);
    }).catch((err) => {
      if (err.response.status === 404)
        console.log("no connection");
      else
        console.log(err);
    });

  }, []);

  if (getData === undefined) {
    return (
      <Loading />
    );
  }

  if (getData.user === 1) {
    return (
      <Main />
    )
  }
  else {
    return (
      <NoUser />
    );
  }
}

export default App

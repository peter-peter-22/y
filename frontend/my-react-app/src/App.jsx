//functions and resources
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import 'material-icons/iconfont/material-icons.css';
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { CreateModals } from "/src/components/modals";
import SharedPages from "/src/components/shared_pages_router";

//components
import Loading from "./components/loading.jsx";
import Main from "./components/logged_in_router.jsx";
import NoUser from "./components/no_user.jsx";
import { UserHook } from "/src/components/user_data";

function App() {
  //get user data
 const getUser=UserHook();

  //choose page
  let Page;
  if (getUser === undefined) {
    Page = Loading;
  }
  else {
    if (getUser.user) {
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

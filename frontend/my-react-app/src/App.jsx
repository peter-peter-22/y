//functions and resources
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import 'material-icons/iconfont/material-icons.css';
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CreateModals } from "/src/components/modals";
import SharedPages from "/src/components/shared_pages_router";
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from '@tanstack/react-query';
import MyTheme from '/src/styles/mui/my_theme.jsx';

//components
import Loading from "./components/loading.jsx";
import Main from "./components/logged_in_router.jsx";
import NoUser from "./components/no_user.jsx";
import { GetUser } from "/src/components/user_data";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

function App() {
  //get user data
  const getUser = GetUser();

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
    <QueryClientProvider client={queryClient}>
      <MyTheme>
        <BrowserRouter>
          <CreateModals />
          <div style={{ position: "relative", zIndex: 0 }}>
            <SharedPages>
              <Page />
            </SharedPages>
          </div>
        </BrowserRouter>
      </MyTheme >
    </QueryClientProvider>
  );
}

export default App

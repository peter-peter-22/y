//functions and resources
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import 'material-icons/iconfont/material-icons.css';
import React, { useContext, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { CreateModals } from "/src/components/modals";
import Pages from "/src/components/router";
import MyTheme from '/src/styles/mui/my_theme.jsx';

//components
import Loading from "./components/loading.jsx";
import NoUser from "./components/no_user.jsx";
import { UserContext, UserProvider } from "/src/components/user_data";
import { PostListProvider } from "/src/components/posts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyTheme>
        <BrowserRouter>
          <UserProvider>
            <PostListProvider>
              <CreateModals />
              <div style={{ position: "relative", zIndex: 0 }}>
                <Pages/>
              </div>
            </PostListProvider>
          </UserProvider>
        </BrowserRouter>
      </MyTheme >
    </QueryClientProvider>
  );
}

export default App

//functions and resources
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/700.css';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CreateModals } from "/src/components/modals";
import Pages from "/src/components/router";
import MyTheme from '/src/styles/mui/my_theme.jsx';

//components
import { PostListProvider } from "/src/components/post_components";
import { UserProvider } from "/src/components/user_data";

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
                <Pages />
              </div>
            </PostListProvider>
          </UserProvider>
        </BrowserRouter>
      </MyTheme >
    </QueryClientProvider>
  );
}

export default App

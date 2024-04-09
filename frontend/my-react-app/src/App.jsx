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

//pages
import Home from "./pages/home";
import Test from "./pages/test";
import Error from "./pages/error";

//components
import Header from "./components/header";
import Footer from "./components/footer";

//styles
import './styles/css/App.css';
import MyTheme from '/src/styles/mui/my_theme.jsx';

//components
import { Container } from '@mui/system';


function App() {
  let isBig = AboveBreakpoint("sm");
  return (
    <Router>
      <MyTheme>
        <div style={{ display: "flex", flexDirection: "column", alignItems: isBig ? "center" : "stretch", overflowY:"hidden"}}>
          <div style={{ display: "flex", flexDirection: "row", padding: isBig ? "revert-layer" : 0 }}>
            <Header />
            <div style={isBig ? { width: "500px" } : { flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/test" element={<Test />} />
                <Route path="*" element={<Error />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </div>
      </MyTheme>
    </Router>
  )
}

export default App

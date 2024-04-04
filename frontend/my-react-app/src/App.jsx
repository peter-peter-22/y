//functions and resources
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

//pages
import Home from "./pages/home";
import Test from "./pages/test";
import Error from "./pages/error";

//components
import Header from "./components/header";

//styles
import './styles/css/App.css';

import MyTheme from './styles/mui/my_theme.jsx';


function App() {
  return (
    <Router>
      <MyTheme>
        <Header />
        <div id="middle">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </div>
        <footer>
          <p>footer</p>
        </footer>
      </MyTheme>
    </Router>
  )
}

export default App

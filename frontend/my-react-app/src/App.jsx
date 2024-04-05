//functions and resources
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import 'material-icons/iconfont/material-icons.css';

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
  return (
    <Router>
      <MyTheme>
        <Container maxWidth="xl" style={{display:"flex",flexDirection:"row"}}>
          <Header />
          <div id="middle">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/test" element={<Test />} />
              <Route path="*" element={<Error />} />
            </Routes>
          </div>
          <Footer/>
        </Container>
      </MyTheme>
    </Router>
  )
}

export default App

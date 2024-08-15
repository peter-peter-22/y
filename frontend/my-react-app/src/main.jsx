import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

//styles
import '/src/styles/css/App.css';
import MyTheme from '/src/styles/mui/my_theme.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <MyTheme>
      <App />
    </MyTheme>
)

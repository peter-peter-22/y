import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Icon } from '@mui/material';
import React, {useState} from "react";
import {  IconButton } from '@mui/material';

function SearchField() {
    const [isFocused, setIsFocused] = React.useState(false);
    const [getText, setText] = React.useState("");

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    function handleChange(e) {
        setText(e.target.value);
    }

    return (<TextField
        variant="outlined"
        sx={{
            width: "100%",
            height: "100%",
            borderRadius: "100px",
            my: 0.5,
            backgroundColor: (isFocused ? "inherit" : "secondary_blue.main"),
            'fieldset': {
                borderWidth: 0,
            },
        }}
        size="small"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="Search"
        InputProps={{
            sx: { borderRadius: '999px', height: "100%" },
            startAdornment: (
                <InputAdornment position="start">
                    <Icon color={isFocused ? "primary" : ""}>
                        search
                    </Icon>
                </InputAdornment>
            ),
            endAdornment: (
                isFocused && getText.length > 0 && <InputAdornment position="end">
                    <Icon color="primary" >
                        cancel
                    </Icon>
                </InputAdornment>
            ),
        }} />);
}

function PlainTextField(props) {
    return (
        <TextField
            {...props}
            sx={{
                "& .MuiInputBase-root": {
                    p: 0,
                },
                '& fieldset': {
                    border: 'none',
                },
            }}
        />
    );
}

function PasswordFieldWithToggle(props) {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
  
    const handleTogglePasswordVisibility = () => {
      setShowPassword((prevShowPassword) => !prevShowPassword);
    };
  
    const handlePasswordChange = (event) => {
        const value = event.target.value;
      setPassword(value);
      props.handlechange(value);
    };

    const propsWithoutHandleChange={...props};
    propsWithoutHandleChange.handlechange=undefined;
  
    return (
        <TextField
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChange}
          {...propsWithoutHandleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleTogglePasswordVisibility}>
                  {showPassword ? <Icon>visibility_off</Icon> : <Icon>visibility</Icon>}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
    );
  }
  

export { SearchField,PlainTextField,PasswordFieldWithToggle };
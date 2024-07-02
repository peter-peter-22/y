import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Icon } from '@mui/material';
import React, { useState } from "react";
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Endpoint, FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function SearchField() {
    const [isFocused, setIsFocused] = React.useState(false);
    const [getText, setText] = React.useState("");
    const navigate = useNavigate();

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    function handleChange(e) {
        setText(e.target.value);
    }

    function handleKey(e) {
        if (e.keyCode == 13) {
            submit();
        }
    }

    async function submit() {
        navigate("/search?q="+getText);
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
        onKeyDown={handleKey}
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

const PlainTextField = React.forwardRef((props, ref) => {
    return (
        <TextField
            inputRef={ref}
            {...props}
            sx={{
                "& .MuiInputBase-root": {
                    p: 0,
                    ...props.input_sx
                },
                '& fieldset': {
                    border: 'none',
                },
                ...props.sx
            }}
        />
    );
});

function PasswordFieldWithToggle(props) {
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <TextField
            type={showPassword ? 'text' : 'password'}
            {...props}
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

const VisuallyHiddenInput = styled('input')({
    height: "100%",
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: "100%",
    opacity: 0
});



export { SearchField, PlainTextField, PasswordFieldWithToggle, VisuallyHiddenInput };
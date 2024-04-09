import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Icon } from '@mui/material';
import React from "react";


function SearchField() {
    const [isFocused, setIsFocused] = React.useState(false);
    const [getText, setText] = React.useState(false);

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
                    <Icon color="primary">
                        cancel
                    </Icon>
                </InputAdornment>
            ),
        }} />);
}

export {SearchField};
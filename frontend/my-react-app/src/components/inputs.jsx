import { Icon, IconButton } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThrowIfNotAxios } from "/src/communication.js";
import { GetSearchText, GetSearchUrl } from "/src/components/search_components";

const topicOrder = {
    Topics: 0,
    Usernames: 1,
    Names: 2
};

function SearchField() {
    const [isFocused, setIsFocused] = React.useState(false);
    const urlText = GetSearchText();
    const [getText, setText] = React.useState(urlText ? urlText : "");
    const navigate = useNavigate();
    const [auto, setAuto] = useState([]);
    const textRef = useRef();
    textRef.current = getText;
    const lastTextRef = useRef();

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    useEffect(() => {
        //update autofill when text changes and prevent duplicated requests
        if (lastTextRef.current !== getText) {
            lastTextRef.current = getText;
            UpdateAutofill(getText);
        }
    }, [getText]);

    function handleKey(e) {
        if (e.keyCode == 13) {
            submit();
        }
    }


    async function submit() {
        window.requestAnimationFrame(() => {
            const text = textRef.current;

            if (text.length <= 0)
                return;

            navigate(GetSearchUrl(text));
        });
    }

    async function UpdateAutofill(val) {
        if (!val || val.length <= 0)
            return;

        try {
            const res = await axios.post("member/search/autofill", {
                text: val
            });
            const sorted = res.data.sort((a, b) => topicOrder[a.group] > topicOrder[b.group] ? 1 : -1);
            setAuto(sorted);
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    return (
        <Autocomplete
            disableClearable
            freeSolo
            options={auto}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => {
                if (typeof option == "string")
                    return option;
                return option.value;
            }}

            inputValue={getText}
            onInputChange={(event, newInputValue) => {
                setText(newInputValue);
            }}

            renderInput={(params) => (
                <TextField
                    {...params}
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
                    placeholder="Search"
                    InputProps={{
                        ...params.InputProps,
                        onKeyDown: handleKey,
                        type: 'search',
                        sx: { borderRadius: '999px', height: "100%" },
                        startAdornment: (
                            <InputAdornment position="start">
                                <Icon color={isFocused ? "primary" : ""}>
                                    search
                                </Icon>
                            </InputAdornment>
                        )
                    }}
                />
            )}
        />
    );
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

export { PasswordFieldWithToggle, PlainTextField, SearchField, VisuallyHiddenInput };


import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';

const primary = {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#fff',
};

const secondary = {
    main: '#00000000',
    light: '#FF0000',
    dark: '#E7E7E8',
    contrastText: '#0F1419',
};

let theme = createTheme({
    palette: {
        primary: primary,
        secondary: secondary,
    },
    shadows: ["none"],
    components: {
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
            },
        },
    }
});

export default function MyTheme(props) {
    return (
        <ThemeProvider theme={theme}>
            {props.children}
        </ThemeProvider>
    );
}
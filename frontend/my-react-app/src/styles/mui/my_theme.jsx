import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const text = '#0F1419';

const primary = {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#fff',
};

const secondary = {
    main: '#E7E7E8',
    light: '#E7E7E8',
    dark: '#E7E7E8',
    contrastText: text,
};

const secondary_blue = {
    main: '#F7F9F9',
    light: '#F7F7F7',
    dark: '#EFF3F4',
    contrastText: text,
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
    },
    typography: {
        fontFamily: [
            "Roboto",
            'Trebuchet MS',
            "sans-serif"
        ].join(','),
        button: {
            textTransform: 'capitalize'
        },
        large: {
            fontSize: "5rem"
        }
    },
});


export default function MyTheme(props) {
    return (
        <ThemeProvider theme={theme}>
            {props.children}
        </ThemeProvider>
    );
}

export {theme};
import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const text = '#0F1419';

const primary = {
    main: '#1D9BF0',
    light: '#4AADEF',
    dark: '#1A8CD8',
    contrastText: '#fff',
};

const secondary = {
    main: '#C1C1C1',
    light: '#E7E7E8',
    dark: '#E7E7E8',
    contrastText: text,
};

const secondaryNoBackground = { ...secondary };
secondaryNoBackground.main = "transparent";

const secondary_blue = {
    main: '#F7F9F9',
    light: '#F7F7F7',
    dark: '#EFF3F4',
    contrastText: text,
};
const black = {
    main: '#000000',
    light: '#000000',
    dark: '#000000',
    contrastText: "#fff",
};

const small_text = "14px";
const big_text = "20px";

const theme = createTheme({
    palette: {
        primary: primary,
        secondary: secondary,
        secondary_blue: secondary_blue,
        black:black,
        secondary_noBg:secondaryNoBackground
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
            textTransform: 'capitalize',
            fontWeight: "bold",
        },
        small_title: {
            fontSize: small_text,
            fontWeight: "bold"
        },
        small_body: {
            fontSize: small_text,
            fontWeight: "normal"
        },
        small_fade: {
            fontSize: small_text,
            color: secondary.main,
            fontWeight: "normal"
        },
        big_title: {
            fontSize: big_text,
            fontWeight: "bold"
        },
        big_body: {
            fontSize: big_text,
            fontWeight: "normal"
        },
        big_fade: {
            fontSize: big_text,
            color: secondary.main,
            fontWeight: "normal"
        }
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
            leftMenu: 900
        },
    },
});





export default function MyTheme(props) {
    return (
        <ThemeProvider theme={theme}>
            {props.children}
        </ThemeProvider>
    );
}

export { theme };

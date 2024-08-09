import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

//colors

const transparentBlack = {
    main: "#00000077",
    dark: '#00000077',
    contrastText: '#fff',
};

const primary = {
    main: '#1D9BF0',
    light: '#E8F5FD',
    dark: '#1A8CD8',
    contrastText: '#fff',
};

const secondary = {
    main: '#7F7F7F',
    light: '#E7E7E8',
    dark: '#E7E7E8',
    contrastText: '0F1419',
};

const secondaryNoBackground = { ...secondary };
secondaryNoBackground.main = "transparent";

const secondary_blue = {
    main: '#F7F9F9',
    light: '#F7F7F7',
    dark: '#EFF3F4',
    contrastText: secondary.contrastText,
};
const black = {
    main: '#000000',
    light: '#000000',
    dark: '#000000',
    contrastText: "#fff",
};

const colors = {
    like: "#F91880",
    share: "#00BA7C",
};

const success = {
    main: "#00B515"
};

//fonts

const medium = {
    fontSize: "1rem",
    fontFamily: "Roboto",
    color: "rgb(15, 20, 25)"
}
const medium_bold = {
    ...medium,
    fontWeight: "bold",
}
const medium_fade = {
    ...medium,
    color: secondary.main,
}

const small = {
    ...medium,
    fontSize: "0.8rem",
}
const small_bold = {
    ...small,
    fontWeight: "bold",
}
const small_fade = {
    ...small,
    color: secondary.main,
}

const big = {
    ...medium,
    fontSize: "1.20rem",
}
const big_bold = {
    ...big,
    fontWeight: "bold",
}
const big_fade = {
    ...big,
    color: secondary.main,
}

const verysmall = {
    ...medium,
    fontSize: "0.6rem",
}
const verysmall_bold = {
    ...verysmall,
    fontWeight: "bold",
}
const verysmall_fade = {
    ...verysmall,
    color: secondary.main,
}

const verybig = {
    ...medium,
    fontSize: "1.75rem",
}
const verybig_bold = {
    ...verybig,
    fontWeight: "bold",
}
const verybig_fade = {
    ...verybig,
    color: secondary.main,
}

//theme
const theme = createTheme({
    palette: {
        primary: primary,
        secondary: secondary,
        secondary_blue: secondary_blue,
        black: black,
        secondary_noBg: secondaryNoBackground,
        transparentBlack: transparentBlack,
        colors,
        success: success
    },

    components: {
        NavLink: {
            styleOverrides: {
                display: "none"
            }
        },
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
            },
        },
        MuiFab: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState.variant === 'extended' && {
                        paddingLeft: "15px",
                        paddingRight: "15px",
                    }),
                    '&:hover,&,&:focus': {
                        boxShadow: 'none',
                    }
                }),
            },
        },
        MuiLink: {
            defaultProps: {
                underline: "hover"
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 15, // Adjust the value as needed
                },
            }
        },
        MuiCssBaseline: {
            styleOverrides: `
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0 30px #FFFFFF inset !important;
            }`,
            //-webkit-text-fill-color: #ffffff !important;
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

        small: small,
        small_bold: small_bold,
        small_fade: small_fade,

        medium: medium,
        medium_bold: medium_bold,
        medium_fade: medium_fade,

        big: big,
        big_bold: big_bold,
        big_fade: big_fade,

        verysmall: verysmall,
        verysmall_bold: verysmall_bold,
        verysmall_fade: verysmall_fade,

        verybig: verybig,
        verybig_bold: verybig_bold,
        verybig_fade: verybig_fade,
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
            leftMenuIcons: 1300,
            rightMenuSmaller: 1060,
            hideRightMenu: 990,
            smallIconMargins: 600,
            bottomTabs: 500
        },
    },
});

export default function MyTheme(props) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {props.children}
            </CssBaseline>
        </ThemeProvider>
    );
}

export { theme };

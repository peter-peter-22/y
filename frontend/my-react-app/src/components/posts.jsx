import React from "react";
import Stack from '@mui/material/Stack';
import SideMenu, { Inside } from "./side_menus.jsx";
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined, BlueTextButton } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ResponsiveButton, ButtonIcon, ButtonSvg, TabButton, PostButton, ProfileButton, TopMenuButton, CornerButton } from "/src/components/buttons.jsx";
import { Grid } from '@mui/material';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { theme } from "/src/styles/mui/my_theme";
import { PlainTextField } from "/src/components/inputs";

function Prefix(props) {
    return (
        <div style={{ width: "30px", display: "flex", justifyContent: "end", padding: "0px 10px", flexShrink: 0 }}>
            {props.children}
        </div>
    )
}

function RowWithPrefix(props) {
    return (
        <Stack direction="row">
            <Prefix>{props.prefix}</Prefix>
            {props.contents}
        </Stack>
    );
}

function Post(props) {
    return (
        <ListBlockButton>
            <Reposted />
            <RowWithPrefix
                prefix={<Avatar src="/images/example profile.jpg" />}
                contents={
                    <Stack direction="column" style={{ overflow: "hidden" }}>
                        <Stack direction="row" spacing={0.25} style={{ alignItems: "center" }}>
                            <UserName />
                            <UserKey />
                            ·
                            <DateLink passed />
                            <ManagePost />
                        </Stack>
                        <PostText />
                        <PostMedia />
                    </Stack>
                } />
            <RowWithPrefix contents={
                <Stack direction="column" style={{ overflow: "hidden" }}>
                    <FromUser />
                    <PostButtonRow />
                </Stack>
            } />
        </ListBlockButton>
    );
}


function PostFocused(props) {
    const [isFocused, setIsFocused] = React.useState(false);
    const [getText, setText] = React.useState("");
    const maxLetters = 280;
    const keep = getText.substring(0, maxLetters);
    const overflow = getText.substring(maxLetters);

    const handleFocus = () => {
        setIsFocused(true);
    };

    function handleChange(e) {
        setText(e.target.value);
    }

    return (
        <ListBlock>
            <Reposted />
            <RowWithPrefix
                prefix={<Avatar src="/images/example profile.jpg" />}
                contents={
                    <Stack direction="column" style={{ overflow: "hidden" }}>
                        <Stack direction="row" spacing={0.25} style={{ alignItems: "center" }}>
                            <ProfileText />
                            <Fab variant="extended" size="small" color="black" style={{ flexShrink: 0 }}>Subscribe</Fab>
                            <ManagePost />
                        </Stack>
                    </Stack>
                } />

            <Stack direction="column" sx={{ overflow: "hidden", mt: 1 }}>
                <PostText />
                <PostMedia />
                <FromUser />
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "baseline", my: 1 }}>
                    <DateLink />
                    <Typography variant="small_fade">·</Typography>
                    <Typography variant="small_bold">999M</Typography>
                    <Typography variant="small_fade">Views</Typography>
                </Stack>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" sx={{ flexGrow: 1, py: 0.5 }}>

                <PostBottomIcon text="999k" >
                    chat_bubble_outline
                </PostBottomIcon>

                <PostBottomIcon text="999k" >
                    loop
                </PostBottomIcon>

                <PostBottomIcon text="999k" >
                    favorite_border
                </PostBottomIcon>

                <PostBottomIcon text="999k" >
                    bookmark_border
                </PostBottomIcon>

                <IconButton size="small">
                    <Icon fontSize="small">
                        upload
                    </Icon>
                </IconButton>
            </Stack>

            <Divider />

            {isFocused &&
                <Box sx={{ my: 1 }} >
                    <RowWithPrefix contents={
                        <ReplyingTo />
                    } />
                </Box>
            }
            <RowWithPrefix
                prefix={
                    <Avatar sx={{ py: 1 }} src="/images/example profile.jpg" />
                }
                contents={
                    <Stack direction={isFocused ? "column" : "row"} style={{ flexGrow: 1 }}>
                        <Box sx={{ pb: 1, pt: 2, display: "inline-flex", flexGrow: 1, position: "relative" }}>

                            <Typography variant="body1"
                                style={{
                                    position: "absolute",
                                    height: "100%",
                                    width: "100%",
                                    overflow: "hidden",
                                    whiteSpace: "pre",
                                    lineHeight: "1.4375em",
                                    overflowWrap: "break-word",
                                    textWrap: "wrap",
                                    color: "transparent"
                                }}
                            >
                                {keep}
                                <mark style={{ background: "#FF000044" }}>{overflow}</mark>
                            </Typography>

                            <PlainTextField
                                placeholder="Post your reply"
                                multiline
                                fullWidth
                                onFocus={handleFocus}
                                onChange={handleChange}
                            />

                        </Box>

                        <Stack direction="row" alignItems="center" >
                            {isFocused &&
                                <Stack direction="row" alignItems="center" justifyContent={"space-between"} style={{ flexGrow: 1 }}>
                                    <Stack direction="row" spacing={0.5}>
                                        <CommentButton>insert_photo</CommentButton>
                                        <CommentButton>gif_box</CommentButton>
                                        <CommentButton>sentiment_satisfied_alt</CommentButton>
                                        <CommentButton>location_on</CommentButton>
                                    </Stack>

                                    <LetterCounter maxvalue={maxLetters} letters={getText.length} />
                                </Stack>
                            }
                            <Fab disabled={getText.length === 0 || getText.length > maxLetters} variant="extended" size="small" color="primary">Reply</Fab>
                        </Stack>
                    </Stack>
                } />
        </ListBlock>
    );
}

function PostButtonRow() {
    return (
        <Stack direction="row" justifyContent="space-between" style={{ flexGrow: 1 }}>

            <PostBottomIcon icon="more_horiz" text="999k" >
                chat_bubble_outline
            </PostBottomIcon>

            <PostBottomIcon icon="more_horiz" text="999k" >
                loop
            </PostBottomIcon>

            <PostBottomIcon icon="more_horiz" text="999k" >
                favorite_border
            </PostBottomIcon>

            <PostBottomIcon icon="more_horiz" text="999k" >
                align_vertical_bottom
            </PostBottomIcon>

            <Stack direction="row">
                <IconButton size="small">
                    <Icon fontSize="small">
                        bookmark_border
                    </Icon>
                </IconButton>

                <IconButton size="small">
                    <Icon fontSize="small">
                        upload
                    </Icon>
                </IconButton>
            </Stack>
        </Stack>
    );
}

function LetterCounter(props) {
    const used = Math.min(props.letters / props.maxvalue * 100, 100);
    const remaining = props.maxvalue - props.letters;
    let warning = false;
    const normalColor = theme.palette.primary.main;
    const warningColor = "yellow";
    const errorColor = "red";
    let circleColor;
    let letterColor;

    if (remaining <= -10) {
        circleColor = "transparent";
        letterColor = errorColor;
        warning = true;
    }
    else if (remaining <= 0) {
        circleColor = errorColor;
        letterColor = errorColor;
        warning = true;
    }
    else if (remaining <= 20) {
        circleColor = warningColor;
        letterColor = "inherit";
        warning = true;
    }
    else {
        circleColor = normalColor;
        letterColor = "inherit";
    }

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate"
                sx={{
                    "& .MuiCircularProgress-circle": {
                        transition: "none"
                    },
                }}
                value={used}
                style={{ margin: "0px 10px", height: "25px", width: "25px", color: circleColor }}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="caption" component="div" style={{ color: letterColor }}>
                    {warning && remaining}
                </Typography>
            </Box>
        </Box>
    );
}

function CommentButton(props) {
    return (
        <IconButton color="primary" size="small">
            <Icon fontSize="small" baseClassName="material-icons-outlined">
                {props.children}
            </Icon>
        </IconButton>
    );
}

function PostList() {
    return (
        <List sx={{ p: 0 }}>
            <PostFocused />
        </List>
    );
}

function BlockImage(props) {
    return (
        <div style={{
            aspectRatio: "1 / 1",
            overflow: "hidden"
        }}>
            <img src={"/images/example profile copy.jpg"} style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
            }} />
        </div>
    )
}

function PostBottomIcon(props) {
    return (
        <IconButton size="small">
            <Icon fontSize="small">
                {props.children}
            </Icon>
            <Typography variant="small" color="secondary" style={{ position: "absolute", left: "90%" }}>{props.text}</Typography>
        </IconButton>);
}

function PostMedia(props) {
    return (
        <Box border={1} borderColor="divider" style={{
            margin: "10px 0px",
            overflow: "hidden",
            borderRadius: "10px",
            boxSizing: "border-box"
        }}>
            <Stack direction="column" spacing="2px">
                <Stack direction="row" spacing="2px">
                    <BlockImage />
                    <BlockImage />
                </Stack>
                <Stack direction="row" spacing="2px">
                    <BlockImage />
                    <BlockImage />
                </Stack>
            </Stack>
        </Box>
    );
}
function PostText(props) {
    return (
        <Typography variant="small">
            post text dgffd dgf dfg gfddgf dgd gdg
        </Typography>
    );
}

function ManagePost(props) {
    return (
        <IconButton size="small"><Icon fontSize="small">more_horiz</Icon></IconButton>
    );
}

function FromUser(props) {
    return (
        <TextRow>
            <Typography variant="small_fade">
                From
            </Typography>
            <UserName />
        </TextRow>
    );
}

function Reposted(props) {
    return (
        <RowWithPrefix
            prefix={<Icon color="secondary" style={{ fontSize: "15px", alignSelf: "end" }}>loop</Icon>}
            contents={<FadeLink style={{ fontWeight: "bold", overflow: "hidden" }}><TextRow><span color="secondary.main" style={noOverflow}><GetUserName /></span>reposted</TextRow></FadeLink>} />
    );
}

function ListBlock(props) {
    return (
        <ListItem sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="column" style={{ overflow: "hidden" }}>
                {props.children}
            </Stack>
        </ListItem>
    );
}

function ListBlockButton(props) {
    return (
        <ListItem disablePadding sx={{ borderBottom: 1, borderColor: "divider" }}>
            <ListItemButton>
                <Stack direction="column" style={{ overflow: "hidden" }}>
                    {props.children}
                </Stack>
            </ListItemButton>
        </ListItem>
    );
}


export { Post, PostList, PostFocused, ListBlockButton, ListBlock, RowWithPrefix,PostButtonRow };
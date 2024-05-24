import React, { useState, useRef, useEffect, forwardRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Stack from '@mui/material/Stack';
import { TopMenu } from '/src/components/utilities';
import { SearchField } from "/src/components/inputs.jsx";
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import { Icon } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider } from '@mui/material';
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, default_image, GetPostPictures, OnlineList, SimplePopOver, formatNumber, TabSwitcherLinks } from '/src/components/utilities';
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
import { PlainTextField, PasswordFieldWithToggle, VisuallyHiddenInput } from "/src/components/inputs";
import { UserData } from "/src/App.jsx";
import config from "/src/components/config.js";
import axios from 'axios';
import { Endpoint, FormatAxiosError, ThrowIfNotAxios } from "/src/communication.js";
import { Error, Modals, ShowImage } from "/src/components/modals";
import { useNavigate } from "react-router-dom";
import { WhoToFollow } from "/src/components/footer";
import Moment from "moment";
import {PostsOfUser,CommentsOfUser} from "/src/components/posts";

function Profile() {
    const user = UserData.getData.user;
    const profileSize = "100px";
    const sideMargins = 1.5;
    const moment = Moment(new Date());
    const baseUrl = "/profile/" + user.username;

    const following = 99999;
    const followers = 99999;

    return (
        <Stack direction="column">
            <Box sx={{
                borderBottom: 1,
                borderColor: "divider",
                backgroundImage: "url('" + default_image + "')",
                height: "144px",
                width: "100%",
                position: "relative",
                marginBottom: "70px",
            }}>
                <Avatar src={GetProfilePicture(UserData.getData.user)} sx={{
                    position: "absolute",
                    transform: "translateY(-50%)",
                    top: "100%",
                    left: "0px",
                    ml: sideMargins,
                    height: profileSize,
                    width: profileSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "solid white 3px",
                }} />
            </Box>
            <Box sx={{ mx: sideMargins, position: "relative" }}>
                <Stack direction="column" spacing={1.5}>
                    <div>
                        <Typography variant="big_bold"><GetUserName user={user} /></Typography>
                        <UserKey user={user} />
                        <Fab sx={{ border: 1, borderColor: "divider", position: "absolute", right: "0px", top: "0px" }} size="small" variant="extended" color="secondary_noBg">
                            Edit profile
                        </Fab>
                    </div>
                    <Typography variant="small_fade" >
                        <TextRow>
                            <Icon style={{ fontSize: "1.5em" }}>calendar_month</Icon>
                            <span>Joined {moment.format('MMMM YYYY')}</span>
                        </TextRow>
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <FadeLink href="#">
                            <TextRow>
                                <Typography variant="small_bold">
                                    {formatNumber(followers)}
                                </Typography>
                                <Typography variant="small_fade">
                                    followers
                                </Typography>
                            </TextRow>
                        </FadeLink>
                        <FadeLink href="#">
                            <TextRow>
                                <Typography variant="small_bold">
                                    {formatNumber(following)}
                                </Typography>
                                <Typography variant="small_fade">
                                    following
                                </Typography>
                            </TextRow>
                        </FadeLink>
                    </Stack>
                </Stack>
            </Box>

            <Stack direction="column" sx={{ mt: 1.5 }}>
                <TabSwitcherLinks tabs={[
                    {
                        text: "Posts",
                        link: baseUrl 
                    },
                    {
                        text: "Replies",
                        link: baseUrl + "/replies"
                    },
                    {
                        text: "Media",
                        link: baseUrl + "/media"
                    },
                    {
                        text: "Likes",
                        link: baseUrl + "/likes"
                    }
                ]} />
                <Routes>
                    <Route path="" element={<PostsOfUser user={user}/>} />
                    <Route path="/replies" element={<CommentsOfUser user={user}/>} />
                </Routes>
            </Stack>

            <WhoToFollow />
        </Stack>
    );
}

export default Profile;
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
import { ResponsiveSelector, ChooseChildBool, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, default_image, GetPostPictures, OnlineList, SimplePopOver, formatNumber, TabSwitcherLinks, Loading, GetProfileBanner } from '/src/components/utilities';
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
import { PostsOfUser, CommentsOfUser, LikesOfUser, ClickableImage, ImageContext, PostModalFrame } from "/src/components/posts";
import { useParams } from "react-router-dom";
import { ProfilePicEditor, ChangeablePicture, UserNameEditor, NameEditor, BirthDateEditor } from "/src/components/create_account";

function Profile() {
    const [user, setUser] = useState();
    const { id } = useParams();

    //download the selected user
    useEffect(() => {
        async function get() {
            try {
                const res = await axios.post(Endpoint("/member/user_profile"), { user_id: id });
                setUser(res.data);
            } catch (err) {
                setUser(undefined);
                ThrowIfNotAxios(err);
            }
        }
        get(id);
    }, [id]);

    if (user) {
        const profileSize = "100px";
        const sideMargins = 1.5;
        const moment = Moment(new Date(user.registration_date));
        const baseUrl = "/profile/" + user.id;

        const following = user.follows;
        const followers = user.followers;

        return (
            <Stack direction="column">
                <Box sx={{
                    position: "relative",
                    marginBottom: "70px",
                    borderBottom: 1,
                    borderColor: "divider"
                }}>
                    <ProfileBanner url={GetProfileBanner(user)} />
                    <Avatar src={GetProfilePicture(user)} sx={{
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
                            <Fab onClick={EditProfile} sx={{ border: 1, borderColor: "divider", position: "absolute", right: "0px", top: "0px" }} size="small" variant="extended" color="secondary_noBg">
                                Edit profile
                            </Fab>
                        </div>
                        <Typography variant="small_fade" >
                            <TextRow>
                                <Icon style={{ fontSize: "1.5em" }}>calendar_month</Icon>
                                <span>Joined {moment.format('MMMM YYYY')}</span>
                            </TextRow>
                        </Typography>

                        {user.bio !== null &&
                            <Typography variant="medium" >
                                {user.bio}
                            </Typography >
                        }

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
                        <Route path="" element={<PostsOfUser user={user} />} />
                        <Route path="/replies" element={<CommentsOfUser user={user} />} />
                        <Route path="/media" element={<MediaOfUser user={user} />} />
                        <Route path="/likes" element={<LikesOfUser user={user} />} />
                    </Routes>
                </Stack>

                <WhoToFollow />
            </Stack>
        );
    }
    else {
        return (
            <Loading />
        );
    }
}

function MediaOfUser(props) {
    const onlineListRef = useRef();
    const user = props.user;

    async function GetEntries(from) {
        try {
            const res = await axios.post(Endpoint("/member/media_of_user"), { from: from, user_id: user.id });
            return res.data;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    function Container(props) {
        const posts = props.entries;
        let urls = []
        posts.forEach(post => {
            urls = urls.concat(GetPostPictures(post.id, post.image_count));
        });
        return (
            <ImageContext.Provider value={urls}>
                <Grid container spacing={1} columns={{ xs: 1, sm: 2, md: 3 }}>
                    {urls.map((url, index) =>
                        <Grid item xs={1} key={index}>
                            <ClickableImage index={index} />
                        </Grid>
                    )}
                </Grid>
            </ImageContext.Provider>
        );
    }

    return (
        <OnlineList getEntries={GetEntries} ref={onlineListRef} entryMapController={Container} key={user.id} />
    );
}

function EditProfile(user) {
    Modals[0].Show(
        <ProfileEditor user={user} />
    );
}

function ProfileEditor(props) {
    const user = props.user;
    const [profile, setProfile] = useState();
    const [banner, setBanner] = useState();
    const [username, setUsername] = useState("");
    const [usernameOk, setUsernameOk] = useState();
    const [name, setName] = useState("");
    const [nameOk, setNameOk] = useState();
    const [bio, setBio] = useState("");
    const [date, setDate] = useState();
    const [dateOk, setDateOk] = useState();

    const saveable = usernameOk && nameOk&&dateOk;

    function submit()
    {
console.log(date);
    }

    return (
        <PostModalFrame>
            <CornerButton onClick={() => { Modals[0].Close(); }}>close</CornerButton>
            <Stack direction="column" spacing={1.5}>
                <Stack direction="row" style={{ justifyContent: "space-between" }}>
                    <Typography variant="big_bold" style={{ marginLeft: "30px" }}>
                        Edit profile
                    </Typography>
                    <Fab variant="extended" size="small" color="black" disabled={!saveable} onClick={submit}>
                        Save
                    </Fab>
                </Stack>
                <BannerChanger onChange={setBanner} current={GetProfileBanner(user)} />
                <ProfilePicEditor size="100px" onChane={setProfile} current={GetProfilePicture(user)} />
                <UserNameEditor onChangeUserName={setUsername} onChangeOk={setUsernameOk} />
                <NameEditor onChangeName={setName} onChangeOk={setNameOk} />
                <TextField
                    label="Bio"
                    multiline
                    rows={"auto"}
                    onChange={(e) => { setBio(e.target.value) }}
                />
                <BirthDateEditor onChangeDate={setDate} onChangeOk={setDateOk} />
            </Stack>
        </PostModalFrame>
    );
}

function BannerChanger(props) {
    function Displayer(props) {
        return (
            <Box sx={{ border: 1, borderColor: "divider" }}>
                <ProfileBanner url={props.url}>
                    {props.button}
                </ProfileBanner>
            </Box>
        );
    }

    return (
        <ChangeablePicture displayer={Displayer} onChange={props.onChange} current={props.current} />
    );
}

function ProfileBanner(props) {
    return (
        <Box style={{ width: "100%", height: "144px", position: "relative" }}>
            <img src={props.url ? props.url : default_image} style={{ height: "100%", width: "100%", objectFit: "cover" }}
                onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = default_image;
                }} />
            {props.children}
        </Box>
    );
}

export default Profile;
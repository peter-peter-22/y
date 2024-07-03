import React, { useState, useRef, useEffect, forwardRef, memo } from "react";
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
import { ResponsiveSelector, ProfileText, FadeLink, UserName, UserKey, noOverflow, DateLink, TextRow, ReplyingTo, GetUserName, GetUserKey, GetProfilePicture, GetPostMedia, OnlineList, SimplePopOver, formatNumber, TabSwitcherLinks, Loading, GetProfileBanner, ProfilePic, ListTitle } from '/src/components/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { BoxList, BoxListOutlined } from '/src/components/containers';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { BlueTextButton, CornerButton } from "/src/components/buttons.jsx";
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
import { SimplifiedPostList, ClickableImage, MediaContext, PostModalFrame } from "/src/components/posts";
import { useParams } from "react-router-dom";
import { ProfilePicEditor, ChangeablePicture, UserNameEditor, NameEditor, BirthDateEditor } from "/src/components/create_account";
import { ManageProfile } from "/src/components/manage_content_button.jsx";
import { Media, mediaTypes } from "/src/components/media";
import { ImageDisplayer, MediaDisplayer } from "/src/components/media";
import { ClickableSingleImageContainer } from "/src/components/posts";
import { UserListExtended } from "/src/pages/follow_people.jsx";
import { ProfileEditor } from "/src/components/profile_editor";
import { Followers, Following, LikesOfUser, CommentsOfUser, PostsOfUser, MediaOfUser } from "/src/components/profile_tabs";

function Profile() {
    const [user, setUser] = useState();
    const { id } = useParams();
    const [localBlocked, setLocalBlocked] = useState();//undefined on start, set when block/unblock happens and overwrites the is_blocked bool 

    //download the selected user
    useEffect(() => {
        async function get() {
            try {
                const res = await axios.post(Endpoint("/member/general/user_profile"), { user_id: id });
                const user = res.data;
                setUser(user);
            } catch (err) {
                setUser(undefined);
                ThrowIfNotAxios(err);
            }
        }
        get(id);
    }, [id]);

    if (user) {
        if (localBlocked !== undefined)
            user.is_blocked = localBlocked;

        return (
            <Routes>
                <Route path="/followers" element={<Followers user={user} />} />
                <Route path="/following" element={<Following user={user} />} />
                <Route path="*" element={<Main user={user} setLocalBlocked={setLocalBlocked} />} />
            </Routes>
        );
    }
    else {
        return (
            <Loading />
        );
    }
}

function ProfileInfo({ user }) {
    const profileSize = "100px";
    const sideMargins = 1.5;
    const moment = Moment(new Date(user.registration_date));
    const baseUrl = GetBaseUrl(user);
    const is_me = user.id === UserData.getData.user.id;
    const following = user.follows;
    const followers = user.followers;

    function EditProfile() {
        Modals[0].Show(
            <ProfileEditor user={user} />
        );
    }

    return (
        <>
            <Box sx={{
                position: "relative",
                marginBottom: "70px",
                borderBottom: 1,
                borderColor: "divider"
            }}>
                <ProfileBannerMemo user={user} />
                <ProfilePic user={user} sx={{
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
                        <div style={{ position: "absolute", right: "0px", top: "0px" }}>
                            {is_me ?
                                <Fab onClick={EditProfile} sx={{ border: 1, borderColor: "divider" }} size="small" variant="extended" color="secondary_noBg">
                                    Edit profile
                                </Fab>
                                :
                                <ManageProfile user={user} onBlock={setLocalBlocked} />
                            }
                        </div>
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
                        <FadeLink to={baseUrl + "/followers"}>
                            <TextRow>
                                <Typography variant="small_bold">
                                    {formatNumber(followers)}
                                </Typography>
                                <Typography variant="small_fade">
                                    followers
                                </Typography>
                            </TextRow>
                        </FadeLink>
                        <FadeLink to={baseUrl + "/following"}>
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
        </>
    );
}


function Main({ user, setLocalBlocked }) {
    return (
        <Stack direction="column">
            <ProfileInfo user={user} />

            {user.is_blocked ?
                <NotVisible user={user} setLocalBlocked={setLocalBlocked} />
                :
                <Visible user={user} />
            }
        </Stack>
    );
}

function NotVisible({ user, setLocalBlocked }) {
    return (
        <Stack direction="column" sx={{ mx: sideMargins, my: 2, }}>
            <Typography variant="big_fade" sx={{ textAlign: "center" }}>
                You blocked this user.
            </Typography>
            <UnblockButton user={user} onUnblock={() => { setLocalBlocked(false) }} />
        </Stack>
    );
}

function Visible({ user }) {
    const baseUrl = GetBaseUrl(user);
    return (
        <>
            <WhoToFollow />

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
        </>
    );
}

function GetBaseUrl(user) {
    return "/profile/" + user.id;
}

function UnblockButton(props) {
    const OnUnblock = props.onUnblock;
    const user_id = props.user.id;

    async function Unblock() {
        try {
            await axios.post(Endpoint("/member/general/block_user"), {
                key: user_id,
                value: false
            });
            OnUnblock();
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    return (
        <BlueTextButton onClick={Unblock}>
            Unblock
        </BlueTextButton>
    );
}

function ProfileBanner({ media, ...props }) {
    return (
        <Box style={{ width: "100%", height: "144px", position: "relative" }}>
            <ClickableSingleImageContainer media={media} style={{ width: "100%", height: "100%" }}>
                <MediaDisplayer media={media} style={{ height: "100%", width: "100%", objectFit: "cover" }}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.style.display = "none";
                    }} />
                {props.children}
            </ClickableSingleImageContainer>
        </Box>
    );
}

const ProfileBannerMemo = memo(({ user, ...props }) => {
    const media = GetProfileBanner(user);
    return (
        <ProfileBanner media={media} {...props} />
    );
});

export default Profile;
export { UnblockButton, ProfileBanner };
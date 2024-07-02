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
    }, [id, UserData.getData]);

    function EditProfile() {
        Modals[0].Show(
            <ProfileEditor user={user} />
        );
    }

    if (user) {
        const profileSize = "100px";
        const sideMargins = 1.5;
        const moment = Moment(new Date(user.registration_date));
        const baseUrl = "/profile/" + user.id;
        if (localBlocked !== undefined)
            user.is_blocked = localBlocked;

        const is_me = user.id === UserData.getData.user.id;

        const following = user.follows;
        const followers = user.followers;

        function ProfileInfo() {
            return (
                <>
                    <Box sx={{
                        position: "relative",
                        marginBottom: "70px",
                        borderBottom: 1,
                        borderColor: "divider"
                    }}>
                        <ProfileBanner media={GetProfileBanner(user)} />
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

        function Visible() {
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

        function NotVisible() {
            return (
                <Stack direction="column" sx={{ mx: sideMargins, my: 2, }}>
                    <Typography variant="big_fade" sx={{ textAlign: "center" }}>
                        You blocked this user.
                    </Typography>
                    <UnblockButton user={user} onUnblock={() => { setLocalBlocked(false) }} />
                </Stack>
            );
        }

        function Main() {
            return (
                <Stack direction="column">
                    <ProfileInfo />

                    {user.is_blocked ?
                        <NotVisible />
                        :
                        <Visible />
                    }
                </Stack>
            );
        }

        return (
            <Routes>
                <Route path="/followers" element={<Followers user={user} />} />
                <Route path="/following" element={<Following user={user} />} />
                <Route path="*" element={<Main />} />
            </Routes>
        );
    }
    else {
        return (
            <Loading />
        );
    }
}

function Followers({ user }) {
    return (
        <Stack direction="column">
            <ListTitle>
                Followers of <GetUserName user={user} />
            </ListTitle>
            <UserListExtended url={Endpoint("/member/general/followers_of_user")} params={{ id: user.id }} />
        </Stack>
    );
}

function Following({ user }) {
    return (
        <Stack direction="column">
            <ListTitle>
                Followed by <GetUserName user={user} />
            </ListTitle>
            <UserListExtended url={Endpoint("/member/general/followed_by_user")} params={{ id: user.id }} />
        </Stack>
    );
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

function MediaOfUser(props) {
    const onlineListRef = useRef();
    const user = props.user;

    async function GetEntries(from) {
        try {
            const res = await axios.post(Endpoint("/member/general/media_of_user"), { from: from, user_id: user.id });
            return res.data;
        }
        catch (err) {
            ThrowIfNotAxios(err);
            return [];
        }
    }

    function Container(props) {
        const posts = props.entries;
        let medias = []
        posts.forEach(post => {
            medias = medias.concat(GetPostMedia(post));
        });
        return (
            <MediaContext.Provider value={medias}>
                <Grid container spacing={1} columns={{ xs: 1, sm: 2, md: 3 }}>
                    {medias.map((media, index) =>
                        <Grid item xs={1} key={index}>
                            <ClickableImage index={index} />
                        </Grid>
                    )}
                </Grid>
            </MediaContext.Provider>
        );
    }

    return (
        <OnlineList getEntries={GetEntries} ref={onlineListRef} entryMapController={Container} key={user.id} />
    );
}

function ProfileEditor(props) {
    const user = props.user;
    const [ok, setOk] = useState(false);
    const valuesRef = useRef({});
    const [uploading, setUploading] = useState(false);

    function updateValue(name, value) {
        valuesRef.current[name] = value;
        const { username_ok, name_ok, date_ok } = valuesRef.current;
        const ok_all = username_ok && name_ok && date_ok;
        setOk(ok_all);
    }

    async function submit() {
        try {
            setUploading(true);
            const form_values = valuesRef.current;
            if (form_values.birthdate)
                form_values.birthdate = new Moment(form_values.birthdate).toISOString();
            await axios.post(
                Endpoint("/member/modify/update_profile"),
                form_values,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            UserData.update();
            Close();
            window.location.reload();
        }
        catch (err) {
            ThrowIfNotAxios(err);
        }
    }

    function Close() {
        Modals[0].Close();
    }

    return (
        <PostModalFrame>
            {uploading ?
                <Loading />
                :
                <>
                    <CornerButton onClick={Close}>close</CornerButton>
                    <Stack direction="column" spacing={1.5}>
                        <Stack direction="row" style={{ justifyContent: "space-between" }}>
                            <Typography variant="big_bold" style={{ marginLeft: "30px" }}>
                                Edit profile
                            </Typography>
                            <Fab variant="extended" size="small" color="black" disabled={!ok} onClick={submit}>
                                Save
                            </Fab>
                        </Stack>
                        <BannerChangerMemo onUploadFile={(v) => { updateValue("banner_pic", v) }} user={user} />
                        <ProfilePicEditor size="100px" onUploadFile={(v) => { updateValue("profile_pic", v) }} user={user} />
                        <UserNameEditor onChangeUserName={(v) => { updateValue("username", v) }} onChangeOk={(v) => { updateValue("username_ok", v) }} />
                        <NameEditor onChangeName={(v) => { updateValue("name", v) }} onChangeOk={(v) => { updateValue("name_ok", v) }} current={user.name} />
                        <BioEditor onChange={(v) => { updateValue("bio", v) }} current={user.bio} />
                        <BirthDateEditor onChangeDate={(v) => { updateValue("birthdate", v) }} onChangeOk={(v) => { updateValue("date_ok", v) }} current={user.birthdate} />
                    </Stack>
                </>
            }
        </PostModalFrame>
    );
}

function BioEditor(props) {
    const [value, setValue] = useState(props.current ? props.current : "");
    const onChange = props.onChange;

    useEffect(() => {
        if (onChange)
            onChange(value);
    }, [value]);

    function handleChange(e) {
        setValue(e.target.value);
    }

    return (
        <TextField
            label="Bio"
            multiline
            rows={"auto"}
            onChange={handleChange}
            value={value}
        />
    );
}

const BannerChangerMemo = memo(({ user, onUploadFile }) => {
    function Displayer({ media, button }) {
        return (
            <Box sx={{ border: 1, borderColor: "divider" }}>
                <ProfileBanner media={media}>
                    {button}
                </ProfileBanner>
            </Box>
        );
    }

    return (
        <ChangeablePicture displayer={Displayer} onUploadFile={onUploadFile} current={GetProfileBanner(user)} />
    );
},
    (prev, now) => prev.user === now.user);

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

function LikesOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="/member/general/likes_of_user" params={{ user_id: user_id }} />;
}

function PostsOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="/member/general/posts_of_user" params={{ user_id: user_id }} />;
}

function CommentsOfUser(props) {
    const user_id = props.user.id;
    return <SimplifiedPostList endpoint="/member/general/comments_of_user" params={{ user_id: user_id }} />;
}


export default Profile;
export { UnblockButton };
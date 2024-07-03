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
import {  CornerButton } from "/src/components/buttons.jsx";
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
import {ProfileBanner} from "/src/pages/profile_main";

function ProfileEditor({user}) {
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

export { ProfileEditor };
import { Box, Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Moment from "moment";
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import { ThrowIfNotAxios } from "/src/communication.js";
import { BirthDateEditor, ChangeablePicture, NameEditor, ProfilePicEditor, UserNameEditor } from "/src/components/account_components";
import { CornerButton } from "/src/components/buttons.jsx";
import { Modals } from "/src/components/modals";
import { PostModalFrame } from "/src/components/posts";
import { UserContext } from "/src/components/user_data";
import { GetProfileBanner, Loading } from '/src/components/utilities';
import { ProfileBanner } from "/src/pages/profile_main";

function ProfileEditor({user}) {
    const [ok, setOk] = useState(false);
    const valuesRef = useRef({});
    const [uploading, setUploading] = useState(false);
    const {update}=useContext(UserContext);
    const queryClient = useQueryClient()

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
                "/member/modify/update_profile",
                form_values,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            queryClient.invalidateQueries({ queryKey: ['profile_'+user.id] })
            update();
            Close();
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


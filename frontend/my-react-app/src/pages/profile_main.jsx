import { Box, Typography } from '@mui/material';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Moment from "moment";
import { Sus } from "/src/components/lazified";

import React, { memo, useCallback, useContext, useState, lazy } from "react";
import { lazily } from 'react-lazily';
import { Route, Routes, useParams } from "react-router-dom";
import { ThrowIfNotAxios } from "/src/communication.js";
import { BlueCenterButton } from "/src/components/buttons";
import { WhoToFollow } from "/src/components/footer";
import { ManageProfile } from "/src/components/manage_content_button.jsx";
import { Modals } from "/src/components/modals";
import { ClickableSingleImageContainer } from "/src/components/post_media";
import { CommentsOfUser, Followers, Following, LikesOfUser, MediaOfUser, PostsOfUser } from "/src/components/profile_tabs";
import { UserContext } from "/src/components/user_data";
import { FadeLink, GetUserName, Loading, TabSwitcherLinks, TextRow, UserKey, formatNumber, noOverflow } from '/src/components/utilities';
import {
    GetProfileBanner,
    ProfilePic
} from "/src/components/utilities_auth";
const ProfileEditor = lazy(() => import("/src/components/profile_editor"));
const { MediaDisplayer } = lazily(() => import('/src/components/media'));


import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { ErrorPageFormatted } from "/src/pages/error";

function Profile() {
    const { id } = useParams();
    const [localBlocked, setLocalBlocked] = useState();//undefined on start, set when block/unblock happens and overwrites the is_blocked bool 

    //download the selected user
    const getUser = useCallback(async () => {
        const res = await axios.post("member/general/user_profile", { user_id: id });
        return res.data;
    });

    const { isPending, data: user, error } = useQuery({
        queryKey: ['profile_' + id],
        queryFn: getUser,
        retry: false
    });

    if (error)
        return <ErrorPageFormatted error={error} />

    if (!isPending) {
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

function ProfileInfo({ user, setLocalBlocked }) {
    const profileSize = "100px";
    const moment = Moment(new Date(user.registration_date));
    const baseUrl = GetBaseUrl(user);
    const { getData } = useContext(UserContext);
    const is_me = user.id === getData.user.id;
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
                    ml: 1.5,
                    height: profileSize,
                    width: profileSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "solid white 3px",
                }} />
            </Box>
            <Box sx={{ mx: 1.5, position: "relative" }}>
                <Stack direction="column" spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                        <div style={{ overflow: "hidden" }}>
                            <Typography variant="big_bold" style={noOverflow}><GetUserName user={user} /></Typography>
                            <UserKey user={user} />
                        </div>
                        <div style={{ flexShrink: 0 }}>
                            {is_me ?
                                <Fab onClick={EditProfile} sx={{ border: 1, borderColor: "divider" }} size="small" variant="extended" color="secondary_noBg">
                                    Edit profile
                                </Fab>
                                :
                                <ManageProfile user={user} onBlock={setLocalBlocked} />
                            }
                        </div>
                    </Stack>
                    <Typography variant="small_fade" >
                        <Stack direction="row" spacing={0.5}>
                            <CalendarMonthIcon style={{ fontSize: "1.5em" }} />
                            <span>Joined {moment.format('MMMM YYYY')}</span>
                        </Stack>
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
            <ProfileInfo user={user} setLocalBlocked={setLocalBlocked} />

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
        <Stack direction="column" sx={{ mx: 1.5, my: 2, }}>
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
            await axios.post("member/general/block_user", {
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
        <BlueCenterButton onClick={Unblock}>
            Unblock
        </BlueCenterButton>
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
export { ProfileBanner };


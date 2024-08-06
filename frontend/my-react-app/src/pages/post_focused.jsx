import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BackButton } from "../components/back_button";
import { ThrowIfNotAxios } from "/src/communication.js";
import { OverrideWithRepost, PostFocused, SimplifiedPostList } from "/src/components/posts.jsx";
import { ListTitle, Loading } from '/src/components/utilities';
import { ErrorPage } from "/src/pages/error";

let focused_id = undefined;
function get_focused_id() {
    return focused_id;
}

export default () => {
    const [post, setPost] = useState();
    const { id } = useParams();
    const [error, setError] = useState(false);

    useEffect(getPost, [id]);

    function getPost() {
        //set the focused id on mounth
        focused_id = id;

        //get and process post
        (async () => {
            try {
                //get post from server
                const result = await axios.post("member/general/get_post", {
                    id: id
                });
                //if success, update state
                const main_post = result.data;
                setPost(main_post);
            }
            catch (err) {
                //if fail, display error
                setError(true);
                ThrowIfNotAxios(err);
            }
        })();

        //clear focused id on dismounth
        return () => {
            focused_id = undefined;
        }
    }

    if (post) {
        post.setPost = setPost;
        const overriden = OverrideWithRepost(post);
        return (
            <List sx={{ p: 0 }}>
                <Stack direction="row" alignItems="center" mx={1}>
                    <BackButton />
                    <ListTitle>Post</ListTitle>
                </Stack>
                <PostFocused post={post} />
                <CommentList post={overriden} />
            </List>
        );
    }
    else if (error) {
        return <ErrorPage text={"This post does not exists"} />
    }
    else
        return <Loading />;
};

function CommentList({ post }) {
    const id = post.id;
    return <SimplifiedPostList endpoint="member/general/get_comments" params={{ id: id }} key={id} post={post} />;
}

export { get_focused_id };

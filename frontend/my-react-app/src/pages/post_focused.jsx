import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BackButton } from "../components/back_button";
import { set_focused_id } from "/src/components/post_focused_components";
import { HideablePostFocusedMemo, OverrideWithRepost, SimplifiedPostList } from "/src/components/posts";
import { ListTitle, Loading } from '/src/components/utilities';
import { ErrorPageFormatted } from "/src/pages/error";

export default () => {
    const { id } = useParams();

    //update focused_id
    useEffect(() => {
        set_focused_id(id);
        return () => {
            set_focused_id(undefined);
        }
    }, [id]);

    //get and process the post
    const getPost = useCallback(async () => {
        const result = await axios.post("member/general/get_post", {
            id: id
        });
        return result.data;
    });

    const { isPending, data: post, error } = useQuery({
        queryKey: ['focused_post_' + id],
        queryFn: getPost,
        retry: false
    });

    if (error)
        return <ErrorPageFormatted error={error} />
    if (isPending) return <Loading />

    //if this is a repost, then the comment section of the original post will be displayed
    const overriden = OverrideWithRepost(post);
    return (
        <List sx={{ p: 0 }}>
            <Stack direction="row" alignItems="center" mx={1}>
                <BackButton />
                <ListTitle>Post</ListTitle>
            </Stack>
            <HideablePostFocusedMemo entry={post} />
            <CommentList post={overriden} />
        </List>
    );
};

function CommentList({ post }) {
    const id = post.id;
    return <SimplifiedPostList endpoint="member/general/get_comments" params={{ id: id }} id={"comments_of_" + id} post={post} />;
}
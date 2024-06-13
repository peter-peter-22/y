import React, { useRef } from 'react'
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage, lazyload, accessibility, responsive, placeholder, AdvancedVideo } from '@cloudinary/react';
import axios from "axios";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";
import { auto as autoFormat } from "@cloudinary/url-gen/qualifiers/format";
import { auto as autoQuality } from "@cloudinary/url-gen/qualifiers/quality";
const cld = new Cloudinary({ cloud: { cloudName: 'dhfm5s5x8' } });
let playingVideoRef;

const mediaTypes = {
    image: 0,
    video: 1
}

//a media object can contain both normal urls and cloud images
//the displayers can display both formats and prioritize cloud
//this is necessary to display the local images before uploading
function Media(type, url, public_id) {
    this.type = type;
    this.url = url;
    this.public_id = public_id;
    this.is_video = () => type === mediaTypes.video;
    this.is_image = () => type === mediaTypes.image;
    this.get_formats = () => { return { url: url, public_id: public_id } };
}

function fileToMedia(file) {
    const url = URL.createObjectURL(file);
    const is_video = file.type.startsWith("video");
    const type = is_video ? mediaTypes.video : mediaTypes.image;
    return new Media(type, url);
}

function BlockMedia(props) {
    return (
        <div
            style={{
                flex: 1,
                aspectRatio: "1 / 1",
                overflow: "hidden",
                position: "relative",
                cursor: "pointer"
            }}
            onClick={props.onClick}>
            <MediaDisplayer
                media={props.media}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />
            {props.children}
        </div>
    )
}

function MediaDisplayer(props) {
    const media = props.media;
    if (!media)
        return;

    if (media.is_image())
        return (
            <ImageDisplayer
                {...media.get_formats()}
                {...props}
            />
        );
    else if (media.is_video())
        return (
            <VideoDisplayer
                {...media.get_formats()}
                {...props}
            />
        );
}

function VideoDisplayer(props) {
    const videoRef = useRef();

    //only one video can play at the same time
    //stop the previus video when another is played
    function handlePlay() {
        if (playingVideoRef && playingVideoRef.current && playingVideoRef !== videoRef)
            playingVideoRef.current.pause();
        playingVideoRef = videoRef;
    }

    //choosing the right displayer depending on the available format
    if (props.public_id !== undefined) {
        const vid = cld.video(props.public_id);
        return (
            <AdvancedVideo
                {...props}
                cldVid={vid}
                onPlay={handlePlay}
                ref={videoRef}
                controls
                plugins={[
                    lazyload(),
                    placeholder({ mode: 'predominant-color' })
                ]}
            />
        );
    }
    else if (props.url) {
        return (
            <video
                {...props}
                controls
                ref={videoRef}
                onPlay={handlePlay}
            >
                <source src={props.url} type="video/mp4" />
            </video>
        );
    }
}

function ImageDisplayer(props) {
    //choosing the right displayer depending on the available format
    if (props.public_id !== undefined) {
        const img = cld.image(props.public_id);
        return (
            <AdvancedImage
                {...props}
                cldImg={img}
                plugins={[
                    lazyload(),
                    responsive({ steps: 200 }),
                    placeholder({ mode: 'predominant-color' })
                ]}
            />
        );
    }
    else if (props.url) {
        return (<img
            {...props}
            src={props.url}
        />)
    }
}

export { fileToMedia, mediaTypes, Media, ImageDisplayer, VideoDisplayer, MediaDisplayer, BlockMedia };
import { AdvancedImage, AdvancedVideo, lazyload, placeholder, responsive } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import React, { memo, useRef } from 'react';
const cld = new Cloudinary({ cloud: { cloudName: 'dhfm5s5x8' } });
let playingVideoRef;

const BlockMedia = memo(({ media, onClick, children }) => {
    return (
        <div
            style={{
                flex: 1,
                aspectRatio: "1 / 1",
                overflow: "hidden",
                position: "relative",
                cursor: "pointer"
            }}
            onClick={onClick}>
            <MediaDisplayer
                media={media}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />
            {children}
        </div>
    )
},
    (prev, next) => {
        const prevFile = prev.media.filedata;
        const nextFile = next.media.filedata;
        if (prevFile && nextFile)
            return prevFile.public_id === nextFile.public_id;
    }
);

function MediaDisplayer({ media, onEmpty, ...props }) {
    if (!media)
        return;

    //overwrite the provided media with onEmpty if it's type is undefined
    let media_ = media;
    if (media.type === undefined && onEmpty)
        media_ = onEmpty;

    if (media_.is_image())
        return (
            <ImageDisplayer
                {...media_.get_formats()}
                {...props}
            />
        );
    else if (media_.is_video())
        return (
            <VideoDisplayer
                {...media_.get_formats()}
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
    const filedata = props.filedata;
    if (filedata !== undefined) {
        const vid = cld.video(filedata.public_id);
        vid.setVersion(filedata.version);
        return (
            <AdvancedVideo
                {...props}
                cldVid={vid}
                onPlay={handlePlay}
                innerRef={videoRef}
                controls
                plugins={[
                    lazyload(),
                    placeholder({ mode: 'predominant-color' })
                ]}
            />
        );
    }
    else if (props.url !== undefined) {
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
    const filedata = props.filedata;
    if (filedata !== undefined) {
        const img = cld.image(filedata.public_id);
        img.setVersion(filedata.version);
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
    else if (props.url !== undefined) {
        return (<img
            {...props}
            src={props.url}
        />)
    }
}

export { BlockMedia, ImageDisplayer, MediaDisplayer, VideoDisplayer };


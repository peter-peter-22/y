const address_modes = {
    localhost: {
        server: "http://localhost:3000"
    },
    dev: {
        server: "http://192.168.1.111.nip.io:3000"
    },
}

const accepted_image_types = ["image/png", "image/jpeg", "image/jpg"];
const accepted_video_types = ["video/mp4"];

const config = {
    accepted_image_types: accepted_image_types.join(", "),
    accepted_media_types: [...accepted_image_types, ...accepted_video_types].join(", "),
    profile_pics_path: "/images/profiles",
    profile_banner_path: "/images/banners",
    post_pics_path: "/images/posts",
    post_videos_path: "/videos/posts",
    address_mode: address_modes.localhost,
}

export default config;
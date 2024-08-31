const accepted_image_types = ["image/png", "image/jpeg", "image/jpg"];
const accepted_video_types = ["video/mp4"];

const env=import.meta.env;

const config = {
    accepted_image_types: accepted_image_types.join(", "),
    accepted_media_types: [...accepted_image_types, ...accepted_video_types].join(", "),
    address_mode: {
        server: env.VITE_SERVER_URL,
        client: env.VITE_CLIENT_URL,
    },
    rechapta_key:env.VITE_RECHAPTA
}

export default config;
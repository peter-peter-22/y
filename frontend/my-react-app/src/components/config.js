import env from "dotenv";
env.config();

const accepted_image_types = ["image/png", "image/jpeg", "image/jpg"];
const accepted_video_types = ["video/mp4"];

const config = {
    accepted_image_types: accepted_image_types.join(", "),
    accepted_media_types: [...accepted_image_types, ...accepted_video_types].join(", "),
    address_mode: {
        server: process.env.REACT_APP_SERVER_URL,
        client: process.env.REACT_APP_CLIENT_URL,
    },
}

export default config;
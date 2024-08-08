const address_modes = {
    localhost: {
        client:"http://localhost:3001",
        server: "http://localhost:3000"
    },
    dev: {
        client: "http://192.168.1.111.nip.io:3001",
        server: "http://192.168.1.111.nip.io:3000"
    },
}

const accepted_image_types = ["image/png", "image/jpeg", "image/jpg"];
const accepted_video_types = ["video/mp4"];

const config = {
    accepted_image_types: accepted_image_types.join(", "),
    accepted_media_types: [...accepted_image_types, ...accepted_video_types].join(", "),
    address_mode: address_modes.localhost,
}

export default config;
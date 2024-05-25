const address_modes = {
    localhost: {
        server:"http://localhost:3000"
    },
    dev: {
        server:"http://192.168.1.111.nip.io:3000"
    },
}

const config = {
    accepted_image_types: "image/png, image/jpeg, image/jpg",
    profile_pics_url: "/images/profiles",
    profile_banner_url: "/images/banners",
    post_pics_url: "/images/posts",
    address_mode: address_modes.localhost,
}

export default config;

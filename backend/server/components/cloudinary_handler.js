import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
    cloud_name: "dhfm5s5x8",
    api_key: "614619697686557",
    api_secret: "LK1MPl5HzmJB4ACHlS38BFIZsVo" // Click 'View Credentials' below to copy your API secret
});

async function uploadMedia(file, public_id, folder) {
    const options = {
        public_id: public_id,
        folder: folder,
        invalidate: true,
    };

    const uploadMethod = getUploadMethod(file);

    const res = await uploadMethod(
        file.tempFilePath,
        options
    );

    const data = new FileData(res);
    return data;
}

function getUploadMethod(file) {
    const bytes = file.size;
    const megabytes = bytes / 1024 / 1024;
    if (megabytes >= 100)
        return cloudinary.uploader.upload_large;
    else
        return cloudinary.uploader.upload;
}

function FileData(upload_response) {
    this.version = upload_response.version;
    this.type = upload_response.resource_type;
    this.public_id=upload_response.public_id;
}

function postsFolder(post_id)
{
    return `posts/${post_id}`;
}
function profileFolder(user_id)
{
    return `users/${user_id}/`;
}
const profileId="profile";
const bannerId="banner";

export { uploadMedia,FileData ,postsFolder,profileFolder,profileId,bannerId};
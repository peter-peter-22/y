import { v2 as cloudinary } from 'cloudinary';
import { CheckErr } from './validations.js';

// Configuration
cloudinary.config({
    cloud_name: "dhfm5s5x8",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

async function uploadMedia(file, public_id, folder) {
    const options = {
        public_id: public_id,
        folder: folder,
        invalidate: true,
        resource_type: "auto"
    };

    const uploadMethod = getUploadMethod(file);

    const res = await uploadMethod(
        file.tempFilePath,
        options
    );

    const data = new FileData(res);
    return data;
}

async function deleteFile(media) {
    const options = {
        invalidate: true,
        resource_type: media.type
    };

    await cloudinary.uploader.destroy(media.public_id, options);
}

function validate_delete(public_id, post_id) {
    //make sure the deleted file belongs to the post to avoid deleting other files with unnatural an request
    if (!public_id.startsWith(postsFolder(post_id)))
        CheckErr("the file you want to delete does not belongs to this post");
}

async function deletePostFile(media, post_id) {
    //can I delete this file?
    validate_delete(media.public_id, post_id);
    //delete
    await deleteFile(media);
}

async function deletePostFiles(medias, post_id) {
    if (!medias)
        return;

    for await (const media of medias) {
        await deletePostFile(media, post_id);
    }
}

async function uploadPostFiles(files, post_id) {
    const fileDatas = [];
    for await (const file of files) {
        const folder = postsFolder(post_id);
        const fileData = await uploadMedia(file, undefined, folder);
        fileDatas.push(fileData);
    }
    return fileDatas;
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
    this.public_id = upload_response.public_id;
}

function postsFolder(post_id) {
    return `posts/${post_id}`;
}
function profileFolder(user_id) {
    return `users/${user_id}/`;
}
const profileId = "profile";
const bannerId = "banner";

export { uploadMedia, FileData, postsFolder, profileFolder, profileId, bannerId, uploadPostFiles, deletePostFiles };
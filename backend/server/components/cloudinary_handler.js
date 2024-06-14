import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
    cloud_name: "dhfm5s5x8",
    api_key: "614619697686557",
    api_secret: "LK1MPl5HzmJB4ACHlS38BFIZsVo" // Click 'View Credentials' below to copy your API secret
});

async function uploadImage(file,public_id,folder)
{
    const options = {
        public_id: public_id,
        folder: folder,
        resource_type: "image",
        invalidate:true
    };

    await cloudinary.uploader.upload(
        file.tempFilePath,
        options
    );
}

async function uploadVideo(file,public_id,folder)
{
    const options = {
        public_id: public_id,
        folder: folder,
        resource_type: "video",
        invalidate:true
    };

   await cloudinary.uploader.upload_large(
        file.tempFilePath,
        options
    );
}

export {uploadImage,uploadVideo};

const mediaTypes = {
    image: 0,
    video: 1
}

//a media object can contain both normal urls and cloud images
//the displayers can display both formats 
//this is necessary to display the local images before uploading
function Media(type, url, filedata,local_file) {
    this.type = type;
    this.url = url;
    this.filedata = filedata;
    this.is_video = () => type === mediaTypes.video;
    this.is_image = () => type === mediaTypes.image;
    this.get_formats = () => { return { url: url, filedata: filedata } };
    this.is_local=()=>local_file!==undefined;
}

function MediaFromFileData(filedata) {
    if (!filedata)
        return new Media();
    const type = filedata.type === "image" ? mediaTypes.image : mediaTypes.video;
    return new Media(type, undefined, filedata);
}

function fileToMedia(file) {
    const url = URL.createObjectURL(file);
    const is_video = file.type.startsWith("video");
    const type = is_video ? mediaTypes.video : mediaTypes.image;
    return new Media(type, url,undefined,file);
}

export { fileToMedia, Media, MediaFromFileData, mediaTypes };

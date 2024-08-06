import Moment from "moment";
import niv from "node-input-validator";

async function CheckV(v) {
  const matched = await v.check();
  if (!matched) {
    CheckErr(Object.values(v.errors)[0].message);
  }
}

function CheckErr(message) {
  const err = new Error(message);
  err.status = 422;
  throw err;
}

niv.extend('name', ({ value }) => {
  if (!is_string(value))
    return false;

  const length = value.length;
  return (length >= 3 && length <= 50);
});
niv.extend('username', ({ value }) => {
  if (!is_string(value))
    return false;

  const length = value.length;
  return (length > 0 && length <= 50);
});
niv.extend('password', ({ value }) => {
  if (!is_string(value))
    return false;

  const length = value.length;
  return (length >= 8 && length <= 50);
});
niv.extend('search', ({ value }) => {
  if (!is_string(value))
    return false;

  const length = value.length;
  return (length >= 1 && length <= 50);
});
niv.extend('mydate', ({ value }) => {
  return !isNaN(new Date(value));
});
niv.extend('datepast', ({ value }) => {
  const moment = new Moment(value);
  if (!moment.isValid())
    return false;
  return !moment.isAfter();
});

function is_string(val) {
  return typeof val === "string";
}

function validate_image(file) {
  validate_any(file, config.accepted_image_types);
}

function validate_video(file) {
  validate_any(file, config.accepted_video_types);
}

function validate_media(file) {
  validate_any(file, config.accepted_media_types);
}

function validate_any(file, accepted_formats) {
  if (file === undefined)
    CheckErr("failed to upload file");
  if (!accepted_formats.includes(file.mimetype))
    CheckErr(`invalid format "${file.mimetype}". accepted formats: ${accepted_formats.join(", ")}`);
}

export { CheckErr, CheckV, validate_image, validate_media, validate_video };

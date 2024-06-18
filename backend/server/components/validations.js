import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import ConnectPg from 'connect-pg-simple';
import env from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import *  as url from "url";
import path from "path";
import fileUpload from "express-fileupload";
import fs from "fs";
import yesql from 'yesql';
const named = yesql.pg;
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";
import niv from "node-input-validator";
import * as g from "../config.js";
import * as pp from "../components/passport.js";
import Moment from "moment";

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
  const length = value.length;
  return (length >= 3 && length <= 50);
});
niv.extend('username', ({ value }) => {
  const length = value.length;
  return (length > 0 && length <= 50);
});
niv.extend('password', ({ value }) => {
  const length = value.length;
  return (length >= 8 && length <= 50);
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

function validate_image(file) {
    validate_any(file,config.accepted_image_types);
}

function validate_video(file) {
    validate_any(file,config.accepted_video_types);
}

function validate_media(file) {
  validate_any(file,config.accepted_media_types);
}

function validate_any(file,accepted_formats)
{
  if (file === undefined)
    CheckErr("failed to upload file");
  if (!accepted_formats.includes(file.mimetype))
    CheckErr(`invalid format "${file.mimetype}". accepted formats: ${accepted_formats.join(", ")}`);
}

export { CheckV, CheckErr, validate_image, validate_video,validate_media };
import express from "express";
import bodyParser from "body-parser";
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
import * as g from "../global.js";
import * as pp from "../components/passport.js";

async function CheckV(v) {
    const matched = await v.check();
    if (!matched) {
        CheckErr(Object.values(v.errors)[0].message);
    }
}

function CheckErr(message)
{
    const err = new Error(message);
    err.status = 422;
    throw err;
}

niv.extend('name', ({ value }) => {
    const length=value.length;
    return(length>=3&&length<=50);
  });  
  niv.extend('username', ({ value }) => {
    const length=value.length;
    return(length>0&&length<=50);
  });  

export { CheckV,CheckErr };
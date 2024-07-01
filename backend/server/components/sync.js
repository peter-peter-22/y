//these must be the same on client and server
const findHashtags = /(\#\w+)/g;
const findHtml = /<[^>]*>?/gm;

export {findHashtags,findHtml};
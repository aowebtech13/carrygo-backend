/* eslint-disable no-console */
const multer = require('multer');
const path =  require('path');

const httpStatus = require('http-status');
const ApiError = require('./ApiError');

const upload = multer({
    storage: multer.diskStorage({}), 
    limits:{
        fileSize: 1024 * 1024 * 500 // max of 50mb
    },
    fileFilter: (req, file, cb) =>{
        const ext = path.extname(file.originalname).toLowerCase()
        console.log('this is the file type ',ext);
        if(ext !== '.jpg' && ext !== '.tiff' && ext !== '.heic' && ext !== '.jpeg' && ext !== '.png' && ext !== '.pdf'){ // && ext !== '.docx' && ext !== '.doc'
            console.log('faulty extension',ext);
            cb(new ApiError(httpStatus.BAD_REQUEST, `Invalid ${ext} file extension. Allowed files are JPG, JPEG, PNG and PDF`));
            return;
        }
        cb(null,true);
    }
});

module.exports = upload;
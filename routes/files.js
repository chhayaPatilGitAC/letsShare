const fileRouter = require('express').Router();
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/file');

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
        cb(null, uniqueFileName);
    }
})

let upload = multer({
    storage,
    limit: { fileSize: 1000000 * 100 }
}).single('myFile');
//upload file route
fileRouter.post('/uploadFile', (req, res) => {
    //upload file
    upload(req, res, async (err) => {
        if (!req.file) {
            return res.json({ error: 'All feilds are required!' })
        }
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        //save file details in database
        const file = new File({
            fileName: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            uuid: uuidv4()
        });

        const response = await file.save();
        return res.json({ file: `${process.env.APP_BASE_URL}/file/getDownloadLink/${response.uuid}` })
    })
})
//get data for file download
fileRouter.get('/getDownloadLink/:uuid', async (req, res) => {
    try {
        if (req.params.uuid) {
            const file = await File.findOne({ uuid: req.params.uuid });
            if (file) {
                return res.render('download', {
                    error: '',
                    filename: file.fileName,
                    filesize: Math.round(file.size / 1024),
                    uuid: file.uuid,
                    downloadLink: `${process.env.APP_BASE_URL}/file/download/${file.uuid}`
                })
            } else
                return res.render('download', { error: 'The link has been expired' })
        } else
            return res.render('download', { error: 'uuid is missing' })
    } catch (e) {
        return res.render('download', { error: 'Something went wrong' })
    }
})

fileRouter.get('/download/:uuid', async (req, res) => {
    try {
        if (req.params.uuid) {
            const file = await File.findOne({ uuid: req.params.uuid });
            if (file) {
                const fileUrl = `${__dirname}/../${file.path}`;
                res.download(fileUrl);
            } else
                return res.render('download', { error: 'The link has been expired' })
        } else
            return res.render('download', { error: 'Invalid file link' })
    } catch (e) {
        return res.render('download', { error: 'Something went wrong' })
    }
})

fileRouter.post('/sendEmail', async (req, res) => {
    const sendMail = require('../services/emailService');
    const { uuid, sender, receiver } = req.body;
    try {
        if (uuid && sender && receiver) {
            //fetch details form DB
            const fileDetails = await File.findOne({ uuid });
            if (fileDetails) {
                //fetch email template
                const link = `${process.env.APP_BASE_URL}/file/getDownloadLink/${fileDetails.uuid}`;
                let emailTemplate = require('../services/emailTemplate')(sender, link);
                const result = sendMail({
                    from: sender,
                    to: receiver,
                    subject: `letsShare : ${sender} has shared a file with you.`,
                    text: '',
                    html: emailTemplate
                });
                res.send({ success: "Email sent successfully" })
            } else {
                return res.send({ error: 'The link has been expired' });
            }
        } else {
            return res.send({ error: 'Sender and receiver are empty' });
        }
    } catch (e) {
        return res.send(e);
    }
})

module.exports = fileRouter;
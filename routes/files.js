const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const multer = require('multer');

const File = require('../models/File');

const checkFileForm = require("../middlewares/inputSanitization/checkFileForm");
const isValidID = require('../middlewares/inputSanitization/isValidID');
const checkFileSearchQueries = require('../middlewares/inputSanitization/checkFileSearchQueries');
const sendFile = require('../middlewares/outputSanitization/sendFile');

const upload = multer({ dest: '/Users/andrea/Documents/Code/Web Development/GDOEN Drive Backend/uploads' });

router.route('/')
    .get(checkFileSearchQueries, async (req, res, next) => {
        try {
            // TODO: req.query.maxSize should be used with $lwi
            const files = await File.find(req.query).exec();

            if (files.length === 0) {
                next(createError(404));
            }

            res.toSend = files;
            next();

        } catch (error) {
            next(createError(500, error));
        }
    }, sendFile)
    .post(upload.any(), async (req, res, next) => {
        let newFiles = [];

        for (let i = 0; i < req.files.length; ++i) {
            const newFile = new File({
                originalName: req.files[i].originalname,
                destination: req.files[i].destination,
                fileName: req.files[i].filename,
                path: req.files[i].path,
                size: req.files[i].size
            })

            try {
                await newFile.save();

                newFiles.push(newFile);

            } catch (error) {
                next(createError(500, error));
            }
        }

        res.toSend = newFiles;
        next();
    }, sendFile)
    .delete( async (req, res, next) => {
        try {
            await File.deleteMany({}).exec();

            res.sendStatus(204);

        } catch (error) {
            next(createError(500, error));
        }
    })

router.route('/:id')
    .get(isValidID, async (req, res, next) => {
        try {
            const file = await File.findById(req.params.id).exec();

            if (!file) {
                next(createError(404));
            }

            res.toSend = file;
            next();

        } catch (error) {
            next(createError(500, error));
        }
    }, sendFile)
    .put(isValidID, checkFileForm, async (req, res, next) => {
        try {
            const modifiedFile = await File.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }).exec();

            if (!modifiedFile) {
                next(createError(404));
            }

            res.toSend = modifiedFile;
            next();

        } catch (error) {
            next(createError(500, error));
        }
    }, sendFile)
    .delete(isValidID, async (req, res, next) => {
        try {
            const removedFile = await File.findByIdAndRemove(req.params.id).exec();

            if (!removedFile) {
                next(createError(404));
            }

            res.sendStatus(204);

        } catch (error) {
            next(createError(500, error));
        }
    })

module.exports = router;

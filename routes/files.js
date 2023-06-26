const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const multer = require('multer');

const File = require('../models/File');

const checkFileForm = require("../middlewares/inputSanitization/checkFileForm");
const isValidID = require('../middlewares/inputSanitization/isValidID');
const handleFileSearchQueries = require('../middlewares/inputSanitization/handleFileSearchQueries');
const isLogged = require('../middlewares/checkAuth/isLogged');

const upload = multer({ dest: '/Users/andrea/Documents/Code/Web Development/GDOEN Drive Backend/uploads' });

router.route('/')
    .get(isLogged, handleFileSearchQueries, async (req, res, next) => {
        try {
            const files = await File.find(req.query).select('originalName size owner _id').exec();

            if (files.length === 0) {
                next(createError(404));
            }

            res.send(files);

        } catch (error) {
            next(createError(500, error));
        }
    })
    .post(isLogged, upload.any(), async (req, res, next) => {
        let newFiles = [];

        for (let i = 0; i < req.files.length; ++i) {
            const newFile = new File({
                originalName: req.files[i].originalname,
                destination: req.files[i].destination,
                fileName: req.files[i].filename,
                path: req.files[i].path,
                size: req.files[i].size,
                owner: req.user._id
            })

            try {
                await newFile.save();

                newFiles.push(newFile);

            } catch (error) {
                next(createError(500, error));
            }
        }

        for (let i = 0; i < newFiles.length; ++i) {
            newFiles[i] = stripFile(newFiles[i]);
        }

        res.send(newFiles);
    })
    .delete(isLogged, async (req, res, next) => {
        try {
            await File.deleteMany({}).exec();

            res.sendStatus(204);

        } catch (error) {
            next(createError(500, error));
        }
    })

router.route('/:id')
    .get(isLogged, isValidID, async (req, res, next) => {
        try {
            const file = await File.findById(req.params.id).select('originalName size owner _id').exec();

            if (!file) {
                next(createError(404));
            }

            res.send(file);

        } catch (error) {
            next(createError(500, error));
        }
    })
    .put(isLogged, isValidID, checkFileForm, async (req, res, next) => {
        try {
            const modifiedFile = await File.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }).select('originalName size owner _id').exec();

            if (!modifiedFile) {
                next(createError(404));
            }

            res.send(modifiedFile);

        } catch (error) {
            next(createError(500, error));
        }
    })
    .delete(isLogged, isValidID, async (req, res, next) => {
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

function stripFile(file) {
    return {
        originalName: file.originalName,
        size: file.size,
        owner: file.owner,
        _id: file._id
    }
}


module.exports = router;

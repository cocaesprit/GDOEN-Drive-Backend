const createError = require('http-errors');

const Joi = require('joi');

const schema = Joi.object({
    originalName: Joi.string(),
    maxSize: Joi.number(),
    _id: Joi.string(),
})

function checkFileSearchQueries(req, res, next) {
    const isValid = schema.validate(req.query);

    if (isValid.error) {
        next(createError(400, isValid.error.details[0].message));
    }

    if (req.query.maxSize) {
        req.query.size = { $lte: req.query.maxSize };
        delete req.query.maxSize;
    }

    next();
}

module.exports = checkFileSearchQueries;

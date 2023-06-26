const createError = require('http-errors');

const Joi = require('joi');

const schema = Joi.object({
    originalName: Joi.string(),
    maxSize: Joi.number(),
    _id: Joi.string(),
})

function handleFileSearchQueries(req, res, next) {
    const isValid = schema.validate(req.query);

    if (isValid.error) {
        next(createError(400, isValid.error.details[0].message));
    }

    req.query.owner = req.user._id;

    if (req.query.maxSize) {
        req.query.size = { $lte: req.query.maxSize };
        delete req.query.maxSize;
    }

    next();
}

module.exports = handleFileSearchQueries;

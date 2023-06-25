const createError = require('http-errors');

const Joi = require('joi');

const schema = new Joi.object({ originalName: Joi.string() });

function checkFileForm(req, res, next) {
    const isValid = schema.validate(req.body);

    if (isValid.error) {
        next(createError(400, isValid.error.details[0].message));
    }

    next();
}

module.exports = checkFileForm;

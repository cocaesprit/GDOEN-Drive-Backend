const createError = require('http-errors');

const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string(),
    surname: Joi.string(),
    email: Joi.string().email(),
    isAdmin: Joi.boolean()
})

function checkUserSearchQueries(req, res, next) {
    const isValid = schema.validate(req.query);

    if (isValid.error) {
        next(createError(400, isValid.error.details[0].message));
    }

    next();
}

module.exports = checkUserSearchQueries;

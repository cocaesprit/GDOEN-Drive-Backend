const createError = require('http-errors');

const Joi = require('joi');

const schema = new Joi.object({
   email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(8)
        .max(90)
        .required(),
})

function checkUserLogin(req, res, next) {
    const isValid = schema.validate(req.body);

    if (isValid.error) {
        next(createError(400, isValid.error.details[0].message));
    }

    next();
}

module.exports = checkUserLogin;

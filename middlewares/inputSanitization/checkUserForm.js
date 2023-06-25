const createError = require('http-errors');

const Joi = require('joi');

const schema = new Joi.object({
    name: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    surname: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(8)
        .max(90)
        .required(),

    roleKey: Joi.string()
})

function checkUserForm(req, res, next) {
    const isValid = schema.validate(req.body);

    if (isValid.error) {
        next(createError(400, isValid.error.details[0].message));
    }

    next();
}

module.exports = checkUserForm;

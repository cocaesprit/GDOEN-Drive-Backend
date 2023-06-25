const createError = require('http-errors');

function isValidID(req, res, next) {
    const param = req.params.id;
    const regExp = /^[a-zA-Z0-9]+$/;

    if (!regExp.test(param) || param.length !== 24) {
        next(createError(400, 'Invalid ID'));
    }

    next();
}

module.exports = isValidID;

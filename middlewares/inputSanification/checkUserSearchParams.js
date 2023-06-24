const createError = require('http-errors');

function checkUserSearchParams(req, res, next) {
    const param = req.params.id;
    const regExp = /^[a-zA-Z0-9]+$/;

    if (!regExp.test(param) || param.length !== 24) {
        next(createError(400, 'Invalid search parameter'));
    }

    next();
}

module.exports = checkUserSearchParams;

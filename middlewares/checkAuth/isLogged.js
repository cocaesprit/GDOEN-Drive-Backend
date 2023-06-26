const createError = require('http-errors');

function isLogged(req, res, next) {
    if (!req.user) {
        next(createError(401))
    }

    next();
}

module.exports = isLogged;

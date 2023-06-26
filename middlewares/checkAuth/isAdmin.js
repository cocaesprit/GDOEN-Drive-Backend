const createError = require('http-errors');

function isAdmin(req, res, next) {
    if (!(req.user && req.user.role === 'admin')) {
        next(createError(401));
    }

    next();
}

module.exports = isAdmin;

const createError = require('http-errors');

function matchUser(req, res, next) {
    if (!(req.user && req.user._id === req.params._id)) {
        next(createError(401));
    }

    next();
}

module.exports = createError;

const createError = require('http-errors');

function sendFile(req, res, next) {
    if (Array.isArray(res.toSend)) {
        for (let i = 0; i < res.toSend.length; ++i) {
            res.toSend[i] = stripFile(res.toSend[i]);
        }

        res.send(res.toSend);
        next();
    }

    if (typeof res.toSend == 'object') {
        res.send(stripFile(res.toSend));
        next();
    }

    next(createError(500, `Cannot send ${typeof res.toSend} to client`));
}

function stripFile(file) {
    return {
        originalName: file.originalName,
        size: file.size,
        _id: file._id
    }
}

module.exports = sendFile;

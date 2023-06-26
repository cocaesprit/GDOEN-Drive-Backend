const createError = require('http-errors');

function sendUser(req, res, next) {
    if (Array.isArray(res.toSend)) {
        for (let i = 0; i < res.toSend.length; ++i) {
            res.toSend[i] = stripUser(res.toSend[i]);
        }

        res.send(res.toSend);
    } else if (typeof res.toSend == 'object') {
        res.send(stripUser(res.toSend));
    } else {
        next(createError(500, `Cannot send ${typeof res.toSend} to client`));
    }
}

function stripUser(user) {
    return {
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        registrationDate: user.registrationDate,
        _id: user._id
    };
}

module.exports = sendUser;

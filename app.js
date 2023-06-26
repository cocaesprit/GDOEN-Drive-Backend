const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const debug = require('debug')('gdoen-drive-backend:server');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./passport');

mongoose.connect(process.env.mongoURL)
    .then( () => debug('Connected to DB'))
    .catch( () => {
      console.error('Couldn\'t connect to DB');
      process.exit(1);
    })

const usersRouter = require('./routes/users');
const filesRouter = require('./routes/files');
const e = require("express");

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use( (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});
app.use(session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(passport.session());

app.use('/users', usersRouter);
app.use('/files', filesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }

    res.status(err.status || 500);

    // If status code is 500 provide error message to client only in development
    if (err.status !== 500) {
        res.send({ message: err.message });
    } else if (process.env.NODE_ENV === 'development') {
        res.send({ message: err.message });
    } else {
        res.send({ message: 'Internal server error' });
    }
});

module.exports = app;

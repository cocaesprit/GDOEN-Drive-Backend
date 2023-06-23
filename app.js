const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const debug = require('debug')('gdoen-drive-backend:server');
const mongoose = require('mongoose');

mongoose.connect(process.env.mongoURL)
    .then( () => debug('Connected to DB'))
    .catch( () => {
      console.error('Couldn\'t connect to DB');
      process.exit(1);
    })

const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use( (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  res.send({ message: err.message });
});

module.exports = app;

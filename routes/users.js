const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const passport = require('../passport');

const User = require('../models/User');

const checkUserForm = require('../middlewares/inputSanitization/checkUserForm');
const isValidID = require('../middlewares/inputSanitization/isValidID');
const checkUserSearchQueries = require('../middlewares/inputSanitization/checkUserSearchQueries');
const sendUser = require('../middlewares/outputSanitization/sendUser');
const checkUserLogin = require('../middlewares/inputSanitization/checkUserLogin');
const isLogged = require('../middlewares/checkAuth/isLogged');
const isAdmin = require('../middlewares/checkAuth/isAdmin');
const matchUser = require('../middlewares/checkAuth/matchUser');

router.route('/')
    .get(checkUserSearchQueries, isLogged, async (req, res, next) => {
      try {
          const users = await User.find(req.query).exec();

          if (users.length === 0) {
              next(createError(404));
          }

          res.toSend = users;
          next();

      } catch (error) {
          next(createError(500, error));
      }
    }, sendUser)
    .post(checkUserForm, async (req, res, next) => {
        switch (req.body.roleKey) {
            case process.env.adminRoleKey:
                req.body.role = 'admin';
                break;

            case process.env.privilegedRoleKey:
                req.body.role = 'privileged';
                break;

            default:
                req.body.role = 'guest';
        }

        const newUser = new User({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
            role: req.body.role
        })

        try {
            await newUser.save();

            res.toSend = newUser;
            next();

        } catch (error) {
            if (error.code === 11000) {
                next(createError(409, 'Email is already registered'));
            }

            next(createError(500, error));
        }
    }, sendUser)
    .delete(isAdmin, async (req, res, next) => {
        try {
            await User.deleteMany({}).exec();

            res.sendStatus(204);

        } catch (error) {
            next(createError(500, error));
        }
    })

router.post('/login', checkUserLogin, passport.authenticate('local'), (req, res, next) => {
    // res.send({ message: 'Logged in', user: req.user });
    res.toSend = req.user;
    next();
}, sendUser)

router.post('/profile', isLogged, (req, res, next) => {
    res.toSend = req.user;
    next();
}, sendUser)

router.route('/:id')
    .get(isValidID, isLogged, async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id).exec();

            if (!user) {
                next(createError(404));
            }

            res.toSend = user;
            next();

        } catch (error) {
            next(createError(500, error));
        }
    }, sendUser)
    .put(isValidID, matchUser, checkUserForm, async (req, res, next) => {
        req.body.password = await bcrypt.hash(req.body.password, 10);

        switch (req.body.roleKey) {
            case process.env.adminRoleKey:
                req.body.role = 'admin';
                break;

            case process.env.privilegedRoleKey:
                req.body.role = 'privileged';
                break;

            default:
                req.body.role = 'guest';
        }

        try {
            const modifiedUser = await User.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }).exec();

            if (!modifiedUser) {
                next(createError(404));
            }

            res.toSend = modifiedUser;
            next();

        } catch (error) {
            next(createError(500, error));
        }
    }, sendUser)
    .delete(isValidID, matchUser, async (req, res, next) => {
        try {
            const removedUser = await User.findByIdAndRemove(req.params.id).exec();

            if (!removedUser) {
                next(createError(404));
            }

            res.sendStatus(204);

        } catch (error) {
            next(createError(500, error));
        }
    })

module.exports = router;

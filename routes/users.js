const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const passport = require('../passport');

const User = require('../models/User');

const checkUserForm = require('../middlewares/inputSanitization/checkUserForm');
const isValidID = require('../middlewares/inputSanitization/isValidID');
const checkUserSearchQueries = require('../middlewares/inputSanitization/checkUserSearchQueries');
const checkUserLogin = require('../middlewares/inputSanitization/checkUserLogin');
const isLogged = require('../middlewares/checkAuth/isLogged');
const isAdmin = require('../middlewares/checkAuth/isAdmin');
const matchUser = require('../middlewares/checkAuth/matchUser');

router.route('/')
    .get(checkUserSearchQueries, isLogged, async (req, res, next) => {
      try {
          const users = await User.find(req.query).select('-password -isAdmin').exec();

          if (users.length === 0) {
              next(createError(404));
          }

          res.send(users)

      } catch (error) {
          next(createError(500, error));
      }
    })
    .post(checkUserForm, async (req, res, next) => {
        if (process.env.roleKey === (process.env.adminRoleKey || 'wineHQ')) {
            req.body.isAdmin = true;
        }

        const newUser = new User({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
            isAdmin: req.body.isAdmin
        })

        try {
            await newUser.save();

            res.send(stripUser(newUser));
        } catch (error) {
            if (error.code === 11000) {
                next(createError(409, 'Email is already registered'));
            }

            next(createError(500, error));
        }
    })
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
    res.send(stripUser(req.user));
})

router.post('/profile', isLogged, (req, res, next) => {
    res.send(stripUser(req.user));
})

router.route('/:id')
    .get(isValidID, isLogged, async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id).select('-password').exec();

            if (!user) {
                next(createError(404));
            }

            res.send(user);

        } catch (error) {
            next(createError(500, error));
        }
    })
    .put(isValidID, matchUser, checkUserForm, async (req, res, next) => {
        req.body.password = await bcrypt.hash(req.body.password, 10);

        if (process.env.roleKey === (process.env.adminRoleKey || 'wineHQ')) {
            req.body.isAdmin = true;
        }

        try {
            const modifiedUser = await User.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }).select('-password').exec();

            if (!modifiedUser) {
                next(createError(404));
            }

            res.send(modifiedUser);

        } catch (error) {
            next(createError(500, error));
        }
    })
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

function stripUser(user) {
    return {
        name: user.name,
        surname: user.surname,
        email: user.email,
        isAdmin: user.isAdmin,
        registrationDate: user.registrationDate,
        _id: user._id
    };
}

module.exports = router;

const express = require('express');
const router = express.Router();

const createError = require('http-errors');
const bcrypt = require('bcrypt');

const User = require('../models/User');

const checkUserForm = require('../middlewares/inputSanification/checkUserForm');
const checkUserSearchParams = require('../middlewares/inputSanification/checkUserSearchParams');

router.route('/')
    .get( async (req, res) => {
      res.send(await User.find({}).exec());
    })
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

            res.send(newUser);
        } catch (error) {
            if (error.code === 11000) {
                next(createError(409, 'Email is already registered'));
            }

            next(createError(500, error));
        }
    })
    .delete( async (req, res, next) => {
        try {
            await User.deleteMany({}).exec();

            res.sendStatus(204);
        } catch (error) {
            next(createError(500, error));
        }
    })

router.route('/:id')
    .get(checkUserSearchParams, async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id).exec();

            if (!user) {
                next(createError(404));
            } else {
                res.send(user);
            }

        } catch (error) {
            next(createError(500, error));
        }
    })
    .put(checkUserSearchParams, checkUserForm, async (req, res, next) => {
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
            } else {
                res.send(modifiedUser);
            }

        } catch (error) {
            next(createError(500, error));
        }
    })
    .delete(checkUserSearchParams, async (req, res, next) => {
        try {
            const removedUser = await User.findByIdAndRemove(req.params.id).exec();

            if (!removedUser) {
                next(createError(404));
            } else {
                res.sendStatus(204);
            }

        } catch (error) {
            next(createError(500, error));
        }
    })

module.exports = router;

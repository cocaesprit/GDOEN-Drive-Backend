const express = require('express');
const router = express.Router();

const createError = require('http-errors');

const User = require('../models/User');

const checkUserForm = require('../middlewares/inputSanification/checkUserForm');

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
            password: req.body.password,
            role: req.body.role
        })

        try {
            await newUser.save();

            res.send(newUser);
        } catch (error) {
            if (error.code === 11000) {
                next(createError(409, 'Email is already registered'));
            }

            next(createError(500));
        }
    })

module.exports = router;

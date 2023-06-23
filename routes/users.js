const express = require('express');
const router = express.Router();

const createError = require('http-errors');

const User = require('../models/User');

const isUserRegistrationValid = require('../middlewares/inputSanification/isUserRegistrationValid');
const e = require("express");

router.route('/')
    .get( async (req, res) => {
      res.send(await User.find({}).exec());
    })
    .post(isUserRegistrationValid, async (req, res, next) => {
        switch (req.body.name) {
            case process.env.adminRoleKey:
                req.body.role = 'admin';
                break;

            case process.env.privilegedRoleKey:
                req.body.role = 'privileged';
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
                next(createError('Email is already registered', 409));
            }

            next(createError(500));
        }
    })

module.exports = router;

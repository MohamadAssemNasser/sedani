const express = require('express');
const {
    body
} = require('express-validator');

const controller = require('../controllers/api');
const router = express.Router();

const login = [
    body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email')
    .notEmpty()
    .withMessage('Email must not be empty')
    .normalizeEmail(),
    body('password', 'Invalid Password')
    .trim()
    .notEmpty()
    .withMessage('Password must not be empty')
    .isAlphanumeric()
    .withMessage('Pasword must be alphanumeric')
    .isLength({
        min: 8
    })
    .withMessage('Pasword must be at least 8 in length')
]

const registration = [
    body('name')
    .trim()
    .notEmpty()
    .withMessage('Name must not be empty'),
    body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email')
    .notEmpty()
    .withMessage('Email must not be empty')
    .normalizeEmail(),
    body('password', 'Invalid Password')
    .trim()
    .notEmpty()
    .withMessage('Password must not be empty')
    .isAlphanumeric()
    .withMessage('Pasword must be alphanumeric')
    .isLength({
        min: 8
    })
    .withMessage('Pasword must be at least 8 in length')
]

router.get('/', (req, res) => {
    res.status(200).json({
        api: 'Sidani\'s API!'
    })
})

router.post('/register', registration, controller.register)

router.post('/login', login, controller.login)

router.get('*', (req, res, next) => res.json({ error: 'Invalid Api Route' }))

module.exports = router
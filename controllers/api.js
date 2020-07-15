const mongodb = require('mongodb')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {
    validationResult
} = require('express-validator')

const User = require('../models/user')
const Trip = require('../models/trip')
const Station = require('../models/station')
const getDb = require('../util/database').getDb

const ObjectId = mongodb.ObjectId

let db

exports.register = async(req, res, next) => {
    db = getDb()
    const validationErrors = validationResult(req)

    if (!validationErrors.isEmpty()) {
        return res.json({
            error: true,
            validationErrors: validationErrors.errors
        })
    }

    try {
        let user = new User({
                name: req.body.name,
                password: req.body.password,
                email: req.body.email,
            })
            // check if email exists
        let u = await db.collection('users').findOne({ email: { $eq: user.email } })
        if (u) {
            return res.status(409).send({
                error: true,
                errorMessage: 'An account with the same email address already exists'
            })
        }
        // password hashing
        bcrypt.hash(user.password, 8,
                async(err, hash) => {
                    if (err) {
                        throw err
                    }
                    user.password = hash
                        // adding user
                    user = await db.collection('users').insertOne(user)
                    user = user.ops[0]
                    console.log(user)
                })
            // response
        return res.status(201).send({
            error: false,
            message: 'User created successfully'
        })
    } catch (err) {
        return res.status(500).send({
            error: true,
            errorMessage: err
        })
    }
}

exports.login = async(req, res, next) => {
    db = getDb()
    try {
        let email = req.body.email
        let password = req.body.password
            // check if email exists
        let user = await db.collection('users').findOne({ email: { $eq: email } })
        if (!user) {
            return res.status(500).send({ // status needed --important--
                error: true,
                errorMessage: 'No account found associated with this email address'
            })
        }
        user = new User(user)
            // check password
        if (await bcrypt.compare(password, user.password)) {
            // generating token
            if (!user.token) {
                user.token = await jwt.sign({ userId: user._id }, process.env.privateKey, { algorithm: 'HS256' }) // need to be changed to RS with ssl --important--
                await db.collection('users').updateOne({ email: { $eq: email } }, { $set: { token: user.token } })
            }
            return res.status(200).send({ // status needed --important--
                error: false,
                token: user.token,
                email: user.email,
                name: user.name
            })
        } else {
            return res.send({ // status needed --important--
                error: true,
                errorMessage: 'The password you entered is incorrect'
            })
        }
    } catch (err) {
        return res.status(500).send({
            error: true,
            errorMessage: err
        })
    }
}

exports.resetPassword = async(req, res, next) => {
    db = getDb()
    try {
        let user = await User.findBy({ email: req.body.email })
        if (user.token != req.body.token) {
            return res.status(403).json({
                error: true,
                errorMessage: 'Invalid Token'
            })
        }
        bcrypt.hash(user.password, 8,
            async(err, hash) => {
                if (err) {
                    throw err
                }
                user.password = hash
                let u = await db.collection('users').findOneAndUpdate({
                    email: {
                        $eq: req.body.email
                    }
                }, {
                    $set: {
                        password: hash
                    }
                })
                if (u.value === null) {
                    // response
                    return res.json({ // status needed --important--
                        error: false,
                        message: 'User not found'
                    })
                }
                console.log('finished')
                return res.status(204).json({
                    error: false,
                    message: 'Password updated successfully'
                })
            })
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            error: true,
            errorMessage: 'Internal Database Error'
        })
    }
}
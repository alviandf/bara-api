const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require("../util/cloudinary");
const upload = require("../util/multer");
const verify = require('./verifyToken');
const nodemailer = require('nodemailer');

const {
    registerValidation,
    loginValidation
} = require('../validation');
const AppError = require('../util/appError');

module.exports = router;
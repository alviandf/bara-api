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

// Register
router.post('/register', upload.single("image"), async (req, res, next) => {
    try {

        const {
            error
        } = registerValidation(req.body);
        if (error) return next(new AppError(error.details[0].message, 400));

        // Check if user already exists
        const emailExist = await User.findOne({
            email: req.body.email
        });
        if (emailExist) return next(new AppError('Email already exists', 400));

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create a new user

        // Upload image to cloudinary
        let secureUrl = null;
        let publicId = "";

        if (req.file != undefined) {
            const result = await cloudinary.uploader.upload(req.file.path);
            secureUrl = result.secure_url;
            publicId = result.public_id;
        }

        let user;
        if (secureUrl != null) {
            user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                avatar: secureUrl,
                cloudinary_id: publicId,
            });
        } else {
            user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                cloudinary_id: publicId,
            });
        }

        const savedUser = await user.save();

        // Send Success Response
        res.json({
            success: true,
            code: '200',
            message: 'Register berhasil, silahkan login',
            data: savedUser,
        });

    } catch (err) {
        next(err);
    }
});

router.post("/", upload.single("image"), async (req, res) => {
    try {
        // Upload image to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "avatar"
        });

        // Create new user
        let user = new User({
            name: req.body.name,
            avatar: result.secure_url,
            cloudinary_id: result.public_id,
        });

        // Save user
        await user.save();
        res.json(user);
    } catch (err) {
        console.log(err);
    }
});


// Login
router.post('/login', async (req, res, next) => {

    // Validate
    const {
        error
    } = loginValidation(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    // Check if user already exists
    const user = await User.findOne({
        email: req.body.email
    });
    if (!user) return next(new AppError('Email is wrong', 400));

    // Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return next(new AppError('Password is wrong', 400));

    // Create and assign a token
    const token = jwt.sign({
        _id: user._id
    }, process.env.TOKEN_SECRET);

    // Send Success Response
    res.json({
        success: true,
        code: '200',
        message: 'OK',
        data: {
            token: token,
            user: user
        },
    });
});


// Update 
router.post('/update', verify, upload.single("image"), async (req, res, next) => {
    try {

        // Lets Validate
        const {
            error
        } = registerValidation(req.body);
        if (error) return next(new AppError(error.details[0].message, 400));

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // == Update User ==

        // Upload image to cloudinary
        let secureUrl = null;
        let publicId = "";

        if (req.file != undefined) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "avatar"
            });
            secureUrl = result.secure_url;
            publicId = result.public_id;
        }

        let user;
        if (secureUrl != null) {
            user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                avatar: secureUrl,
                cloudinary_id: publicId,
            });
        } else {
            user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                cloudinary_id: publicId,
            });
        }

        const savedUserUpdated = await User.findOneAndUpdate({
            email: req.body.email
        }, {
            $set: {
                name: req.body.name,
                password: hashedPassword,
                avatar: secureUrl,
                cloudinary_id: publicId,
            }
        }, {
            new: true
        });

        // Send Success Response
        res.json({
            success: true,
            code: '200',
            message: 'Register berhasil, silahkan login',
            data: savedUserUpdated,
        });

    } catch (err) {
        next(err);
    }
});

// Get Profile
router.get('/profile', verify, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        // console.log(user);
        // res.json(user);

        res.json({
            success: true,
            code: '200',
            message: 'OK',
            data: user,
        });

    } catch (err) {
        next(err);
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res, next) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({
            email: email
        });

        if (!user) return next(new AppError('Email is wrong', 400));

        const token = jwt.sign({
            _id: user._id
        }, process.env.TOKEN_SECRET, {
            expiresIn: '1d'
        });

        const url = `${req.protocol}://${req.get('host')}/api/user/reset-password/${token}`;
        console.log(url);

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_HOST_USER,
                pass: process.env.EMAIL_HOST_PASSWORD,
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Bara Learn Arabic 📚" <bara.learn@outlook.com>', // sender address
            to: user.email, // list of receivers
            subject: "Bara || Reset Password", // Subject line
            text: "Reset Password", // plain text body
            html: `<a href="${url}">Click here to reset your password</a>`, // html body
        });

        console.log("Message sent: %s", info.messageId);

        res.json({
            success: true,
            code: '200',
            message: 'OK',
            data: {
                message: 'Email has been sent'
            },
        });

    } catch (err) {
        next(err);
    }
})

router.get('/reset-password/:token', (req, res, next) => {
    try {
        const user = User.findOne({
            _id: req.params.id
        });
        const token = req.params.token;

        if (!user) return next(new AppError('User not found', 404));
        if (!token) return next(new AppError('Token is not provided', 400));

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if (!decoded) return next(new AppError('Token is not valid', 400));

        res.render('reset-password', {
            email: user.email
        });
    } catch (err) {
        next(err);
    }
});

router.post('/reset-password/:token', async (req, res, next) => {
    try {
        const {
            password,
            password2
        } = req.body;

        if (password.length < 6) return next(new AppError('Password is too short', 400));
        if (password !== password2) return next(new AppError('Password is not match', 400));

        const {
            token
        } = req.params;

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if (!decoded) return next(new AppError('Token is not valid', 400));

        const user = await User.findById(decoded._id);
        if (!user) return next(new AppError('User not found', 404));

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;

        await user.save();

        res.json({
            success: true,
            code: '200',
            message: 'OK',
            data: {
                message: 'Password has been updated, Now you can login with the new password'
            },
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
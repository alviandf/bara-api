const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require("../util/cloudinary");
const upload = require("../util/multer");

const {
    registerValidation,
    loginValidation
} = require('../validation');
const AppError = require('../util/appError');

// Register
router.post('/register', upload.single("image"), async (req, res, next) => {
    try {

        // // Upload image to cloudinary
        // const result = await cloudinary.uploader.upload(req.file.path);

        // // Create new user
        // let user = new User({
        //     name: req.body.name,
        //     avatar: result.secure_url,
        //     cloudinary_id: result.public_id,
        // });

        // // Save user
        // await user.save();
        // res.json(user);

        // Lets Validate
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

        // const user = new User({
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: hashedPassword,
        //     avatar: secureUrl,
        //     cloudinary_id: publicId,
        // });

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
    // res.header('auth-token', token).send({user, token});

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
router.post('/update', upload.single("image"), async (req, res, next) => {
    try {

        // Lets Validate
        const {
            error
        } = registerValidation(req.body);
        if (error) return next(new AppError(error.details[0].message, 400));

        // Check if user already exists
        // const emailExist = await User.findOne({
        //     email: req.body.email
        // });
        // if (emailExist) return next(new AppError('Email already exists', 400));

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

        // const user = new User({
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: hashedPassword,
        //     avatar: secureUrl,
        //     cloudinary_id: publicId,
        // });

        // const savedUser = await user.update();

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

        // const savedUser = await user.updateOne({
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: hashedPassword,
        //     avatar: secureUrl,
        //     cloudinary_id: publicId,
        // });

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

module.exports = router;
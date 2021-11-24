const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {registerValidation, loginValidation} = require('../validation');
const AppError = require('../util/appError');

router.post('/register', async (req, res, next)=>{

    // Lets Validate
    const {error} = registerValidation(req.body);
    if(error) return next(new AppError(error.details[0].message, 400));
    
    // Check if user already exists
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return next(new AppError('Email already exists', 400));
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try{
        const savedUser = await user.save();

        // Send Success Response
        res.json({
            success: true,
            code: '200',
            message: 'Register berhasil, silahkan login',
            data: savedUser,
        });

    } catch(err){
        next(err);
    }
});

// Login
router.post('/login', async (req, res, next)=>{

    // Validate
    const {error} = loginValidation(req.body);
    if(error) return next(new AppError(error.details[0].message, 400));

    // Check if user already exists
    const user = await User.findOne({email: req.body.email});
    if(!user) return next(new AppError('Email is wrong', 400));

    // Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return next(new AppError('Password is wrong', 400));
    
    // Create and assign a token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
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

module.exports = router;
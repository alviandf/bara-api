const router = require('express').Router();
const User = require('../model/User');
const verify = require('./verifyToken');

router.get('/', async (req, res) => {
    // res.json({
    //     posts: {
    //         title: 'My first post',
    //         description: 'This is my first post'
    //     }
    // });

    // User.findOne({_id: req.user._id}, (err, user) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         res.send({user: user, posts: "This is my first post"});
    //     }
    // });

    try {
        // User.updateMany({}, {
        //     "$set": {
        //         "avatar": "https://res.cloudinary.com/dfm7qje8a/image/upload/v1642154801/default-avatar.jpg"
        //     }
        // });

        // await User.find().forEach(function (user) {
        //     user.avatar = "https://res.cloudinary.com/dfm7qje8a/image/upload/v1642154801/default-avatar.jpg"
        //     User.save(user);
        // })


        const user = await User.find({
            avatar: ""
        })

        for (let i = 0; i < user.length; i++) {
            user[i].avatar = "https://res.cloudinary.com/dfm7qje8a/image/upload/v1642154801/default-avatar.jpg"
            await user[i].save();
        }

        res.json(user);

    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
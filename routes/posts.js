const router = require('express').Router();
const User = require('../model/User');
const verify = require('./verifyToken');

router.get('/', verify,(req, res) => {
    // res.json({
    //     posts: {
    //         title: 'My first post',
    //         description: 'This is my first post'
    //     }
    // });

    User.findOne({_id: req.user._id}, (err, user) => {
        if(err) {
            console.log(err);
        } else {
            res.send({user: user, posts: "This is my first post"});
        }
    });
});

module.exports = router;
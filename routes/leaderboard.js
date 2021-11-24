const router = require('express').Router();
const User = require('../model/User');
const verify = require('./verifyToken');

router.get('/', verify, async (req, res) => {

    // Get Leaderboard
    try{
        const leaderboard = await User.find({}, 'name points exp').sort({points: -1}).limit(10);
        res.json({
            success: true,
            code: '200',
            message: 'OK',
            data: leaderboard,
        });
    } catch(err){
        next(err);
    }

});

module.exports = router;
const router = require('express').Router();
const User = require('../model/User');

// const CompletedLevel = require('../model/CompletedLevel');
const verify = require('./verifyToken');

// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

router.get('/', verify, async (req, res) => {

    // Get Leaderboard
    try{
        const leaderboard = await User.find({}, 'name points exp').sort({points: -1}).limit(10);
        res.send(leaderboard);
    } catch(err){
        res.status(400).send(err);
    }

});

module.exports = router;
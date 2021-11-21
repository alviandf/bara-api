const router = require('express').Router();

const User = require('../model/User');
const CompletedLevel = require('../model/CompletedLevel');
const verify = require('./verifyToken');

router.post('/complete', verify, async (req, res) => {
    // res.json({
    //     posts: {
    //         title: 'My first post',
    //         description: 'This is my first post'
    //     }
    // });

    // Insert Completed Level
    const completedLevel = new CompletedLevel({
        userId: req.user._id,
        category: req.body.category,
        chapter: req.body.chapter,
        level: req.body.level
    });

    // Check Is Completed
    const isCompleted = await CompletedLevel.findOne({
        userId: req.user._id,
        category: req.body.category,
        chapter: req.body.chapter,
        level: req.body.level
    });
    if(isCompleted) return res.send("Level already completed");
    
    // Save Completed Level
    try{
        const savedCompletedLevel = await completedLevel.save();
        if(savedCompletedLevel){
            const user = await User.findOne({_id: req.user._id});
            user.exp += 100; // Add exp
            user.points += 100; // Add points
            const savedUser = await user.save();
        } 
        res.send(savedCompletedLevel);
    } catch(err){
        res.status(400).send(err);
    }
});

module.exports = router;
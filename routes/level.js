const router = require('express').Router();

const User = require('../model/User');
const CompletedLevel = require('../model/CompletedLevel');
const verify = require('./verifyToken');

/*

API /complete
200 = OK
201 = Level already completed

*/

router.post('/complete', verify, async (req, res, next) => {
    
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
    if(isCompleted){
        res.json({
            success: true,
            code: '201',
            message: 'Level already completed',
            data: null,
        });
    }
    
    // Save Completed Level
    try{
        const savedCompletedLevel = await completedLevel.save();
        if(savedCompletedLevel){
            const user = await User.findOne({_id: req.user._id});
            user.exp += 100; // Add exp
            user.points += 100; // Add points
            await user.save();
        } 
        res.json({
            success: true,
            code: '200',
            message: 'OK',
            data: savedCompletedLevel,
        });
    } catch(err){
        next(err);
    }
});

/*

API /episode
200 = OK

*/

router.get('/episode', verify, async (req, res, next) => {

    try{
        // Get Completed Levels
        const completedLevels = await CompletedLevel.find({
            userId: req.user._id,
            category: req.body.category,
            chapter: req.body.chapter
        });
        res.json({
            success: true,
            code: '200',
            message: 'OK',
            data: completedLevels,
        });
    }catch(err){
        next(err);
    }
    
});

module.exports = router;
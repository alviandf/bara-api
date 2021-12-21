const router = require('express').Router();

const User = require('../model/User');
const SavedLevel = require('../model/SavedLevel');
const verify = require('./verifyToken');

/*

API /complete
200 = OK
201 = Level Updated

*/

router.post('/save', verify, async (req, res, next) => {

    try {
        // Check Is Completed
        const isCompleted = await SavedLevel.findOne({
            userId: req.user._id,
            category: req.body.category,
            chapter: req.body.chapter,
            level: req.body.level
        });
        if (isCompleted) {

            // Update Level
            const savedLevelUpdated = await SavedLevel.findByIdAndUpdate(isCompleted._id, req.body, {
                new: true
            });

            return res.json({
                success: true,
                code: '201',
                message: 'Level Updated',
                data: savedLevelUpdated,
            });
        }


        // Insert Completed Level
        const savedLevel = new SavedLevel({
            userId: req.user._id,
            category: req.body.category,
            chapter: req.body.chapter,
            level: req.body.level,
            isCompleted: req.body.isCompleted
        });

        // Save Completed Level
        const savedCompletedLevel = await savedLevel.save();
        if (savedCompletedLevel) {
            const user = await User.findOne({
                _id: req.user._id
            });
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
    } catch (err) {
        next(err);
    }
});

/*

API /episode
200 = OK

*/

router.get('/episode', verify, async (req, res, next) => {

    try {

        console.log(req.user);
        console.log(req.query);

        // Get Completed Levels
        const savedLevels = await SavedLevel.find({
            userId: req.user._id,
            category: req.query.category,
            chapter: req.query.chapter
        });
        res.json({
            success: true,
            code: '200',
            message: 'OK',
            data: savedLevels,
        });
    } catch (err) {
        next(err);
    }

});

module.exports = router;
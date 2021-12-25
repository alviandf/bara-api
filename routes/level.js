const router = require('express').Router();

const User = require('../model/User');
const SavedLevel = require('../model/SavedLevel');
const Level = require('../model/Level');
const verify = require('./verifyToken');
const cloudinary = require("../util/cloudinary");
const upload = require("../util/multer");

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
            episode: req.body.episode,
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
            episode: req.body.episode,
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
            episode: req.query.episode
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


router.get('/sound', async (req, res, next) => {

    try {

        // Get Sound From Cloudinary
        const input = await cloudinary.search
            .expression(`filename:(${req.query.name}*) AND folder=sound`)
            .max_results(10)
            .execute()

        res.json({
            success: true,
            code: '200',
            message: 'OK',
            data: sound.resources[0].secure_url
        });

    } catch (err) {
        next(err);
    }

});

router.post('/input', async (req, res, next) => {

    try {

        const input = req.body
        input.forEach(async (level) => {

            const isExist = await Level.findOne({
                category: req.body.category,
                episode: req.body.episode,
                level: req.body.level,
            });

            let inputedLevel;
            if (isExist) {
                inputedLevel = await Level.findByIdAndUpdate(isExist._id, req.body, {
                    new: true
                });
            } else {
                newLevel = new Level(level);
                inputedLevel = await newLevel.save();
            }

        });

        res.json({
            success: true,
            code: '200',
            message: 'OK',
            data: "OK",
        });

    } catch (err) {
        next(err);
    }

});

router.get('/list', verify, async (req, res, next) => {

    try {

        // Get List Level
        const levels = await Level.find({
            category: req.query.category,
            episode: req.query.episode,
        }).sort({
            level: 1
        });

        const savedLevels = await SavedLevel.find({
            userId: req.user._id,
            category: req.query.category,
            episode: req.query.episode
        });

        // Check if level saved
        let arr = [];
        for (let level of levels) {
            for (let savedLevel of savedLevels) {
                let isCompleted;

                if (level.category === savedLevel.category && level.episode === savedLevel.episode && level.level === savedLevel.level) {
                    isCompleted = savedLevel.isCompleted
                } else {
                    isCompleted = null
                }

                const data = JSON.parse(JSON.stringify(level));
                const obj = {
                    ...data,
                    isCompleted: isCompleted
                };

                arr.push(obj)
            }
        }

        res.json({
            success: true,
            code: '200',
            message: 'OK',
            data: arr,
        });

    } catch (err) {
        next(err);
    }

});

router.get('/detail', verify, async (req, res, next) => {

    try {

        const level = await Level.findOne({
            category: req.query.category,
            episode: req.query.episode,
            level: req.query.level,
        })

        const savedLevel = await SavedLevel.findOne({
            userId: req.user._id,
            category: req.query.category,
            episode: req.query.episode,
            level: req.query.level
        });

        const sound = await cloudinary.search
            .expression(`filename:(${level.question}*) AND folder=sound`)
            .max_results(10)
            .execute()

        let soundUrl = null;
        if (sound.resources[0] != null) {
            soundUrl = sound.resources[0].secure_url
        }

        const isCompleted = savedLevel ? savedLevel.isCompleted : null;

        const data = JSON.parse(JSON.stringify(level));
        const obj = {
            ...data,
            isCompleted: isCompleted,
            sound: soundUrl
        };

        res.json({
            success: true,
            code: '200',
            message: 'OK',
            data: obj,
        });

    } catch (err) {
        next(err);
    }

});

module.exports = router;
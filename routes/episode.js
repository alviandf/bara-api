const router = require('express').Router();

const Level = require('../model/Level');
const verify = require('./verifyToken');
const SavedLevel = require('../model/SavedLevel');

router.get('/list', verify, async (req, res, next) => {

    try {

        // Get Episode List
        let episodeIndex = 1;
        let arr = [];
        while (true) {

            const levels = await Level.find({
                category: req.query.category,
                episode: episodeIndex,
            })

            if (!levels.length) {
                break;
            }

            const savedLevel = await SavedLevel.find({
                userId: req.user._id,
                category: req.query.category,
                episode: episodeIndex,
                isCompleted: true
            });

            const progress = (Math.floor((savedLevel.length / levels.length) * 100) / 100).toFixed(2);

            const obj = {
                episode: episodeIndex,
                progress: progress,
                levels: levels.length,
            }

            arr.push(obj);
            episodeIndex++;
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

module.exports = router;
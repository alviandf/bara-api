const mongoose = require('mongoose');

const completedLevelSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    category: {
        type: String,
        required: true,
        enum: {
            values: [
                'reading',
                'writing',
                'listening',
                'speaking'
            ],
            message: '{VALUE} is unknown'
        }
    },
    chapter: {
        type: Number,
        required: true
    },
    level: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('CompletedLevel', completedLevelSchema);
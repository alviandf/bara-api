const mongoose = require('mongoose');

const savedLevelSchema = new mongoose.Schema({
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
    episode: {
        type: Number,
        required: true
    },
    level: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('SavedLevel', savedLevelSchema);
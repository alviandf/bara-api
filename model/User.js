const moongoose = require('mongoose');

const userSchema = new moongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    date: {
        type: Date,
        default: Date.now
    },
    exp : {
        type: Number,
        default: 0
    },
    points : {
        type: Number,
        default: 0
    },
});

module.exports = moongoose.model('User', userSchema);
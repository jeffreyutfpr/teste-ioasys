const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const StarSchema = new mongoose.Schema({
    star: {
        type: Number,
        require: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Star = mongoose.model('Star', StarSchema);

module.exports = Star;
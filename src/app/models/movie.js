const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    director: {
        type: String,
        require: true,
    },
    genre: {
        type: String,
        require: true,
    },
    status: {
        type: Boolean,
        require: false,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Movie = mongoose.model('Movie', MovieSchema);

module.exports = Movie;
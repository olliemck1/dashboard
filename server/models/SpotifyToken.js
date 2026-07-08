const mongoose = require('mongoose')

const spotifyTokenSchema = new mongoose.Schema({

    dashboardId: {
        type: String,
        default: 'primary_user',
        unique: true
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    } 
});

module.exports = mongoose.model('SpotifyToken', spotifyTokenSchema)
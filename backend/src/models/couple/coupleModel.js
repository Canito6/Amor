const mongoose = require('mongoose');

const coupleSchema = new mongoose.Schema({
  partner1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  partner2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  names: {
    type: String,
    default: ''
  },
  relationshipDate: {
    type: Date
  },
  spotifyPlaylist: {
    type: String,
    default: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX5YxZ2718Eld?utm_source=generator&theme=0'
  }
}, { timestamps: true });

module.exports = mongoose.model('Couple', coupleSchema);

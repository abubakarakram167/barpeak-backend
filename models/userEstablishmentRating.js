const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userEstablishmentRating = new Schema({
  userId: {
    type: String,
    required: true
  },
  establishmentId: {
    type: String,
    required: true
  },
  ratingSaveTime: {
    type: String,
    required: true
  },
  createdAt: {type: Date, default: Date.now, expires: 3600} 
});

module.exports = mongoose.model('UserEstablishmentRating', userEstablishmentRating );

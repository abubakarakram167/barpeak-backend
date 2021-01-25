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
  expire_at: {
    type: Date, default: Date.now, expires: 100
  } 
 
});

module.exports = mongoose.model('UserEstablishmentRating', userEstablishmentRating );

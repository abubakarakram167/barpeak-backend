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
  createdAt: Date 
});

userEstablishmentRating.index( { "createdAt": 1 }, { expireAfterSeconds: 3600 } )

module.exports = mongoose.model('UserEstablishmentRating', userEstablishmentRating );

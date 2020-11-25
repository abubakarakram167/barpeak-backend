const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vibeSchema = new Schema(
  {
    crowdedPlace: {
      type: Boolean,
      required: true
    },
    nightLife:{
      type: Boolean,
      required: true
    },
    ageInterval: {
      type: String,
      required: true
    },
    barType: {
      type: String
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vibe', vibeSchema);

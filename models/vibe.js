const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vibeSchema = new Schema(
  {
    crowdedPlace: {
      type: Boolean,
      required: true
    },
    expensivePlace: {
      type: Boolean,
      required: true
    },
    isPartner: {
      type: Boolean,
      required: true
    },
    barOrRestaurant:{
      type: String,
      required: true
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

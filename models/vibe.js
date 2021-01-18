const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vibeSchema = new Schema(
  {
    fun: {
      type: String,
      required: true
    },
    party:{
      type: String,
      required: true
    },
    barOrNightClub: {
      type: String,
      required: true
    },
    crowdLevel: {
      type: String,
      required: true
    },
    ageDemographic: {
      type: String,
      required: true
    },
    vibeCategory: {
      type: String,
      required: true
    },
    selectedCategories: [],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vibe', vibeSchema);

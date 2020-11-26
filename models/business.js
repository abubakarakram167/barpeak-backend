const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const businessSchema = new Schema(
  {
    placeId: {
      type: String,
      required: true
    },
    category: {  
      type: Schema.Types.ObjectId,
      ref: 'category',
      required: true
    }
    ,
    title: {
      type: String,
      required: true
    },
    shortDescription: {
      type: String,
      required: true,
      default: "The Cruise Bar For Your Entertainment"
    },
    longDescription: {
      type: String,
      default: "Shaken, stirred or straight up, The Maholo’s bar service handles all types of events.Our bar catering is fully licensed to provide alcohol service for any occasion. Whether you need stand-alone party bartenders or full bar services, we have the perfect package for you."
    }
    ,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ageInterval:{
      type: String,
      default: "young"
    },
    rating: {
      fun: { type: Number },
      crowd: { type: Number },
      girlToGuyRatio: { type: Number },
      difficultyGettingIn: { type: Number },
      difficultyGettingDrink: { type: Number}
    },
    totalUserCountRating:{
      type: Number,
      default: 0
    },
    accumulatedRating: {
      fun: { type: Number, default: 0 },
      crowd: { type: Number, default: 0 },
      girlToGuyRatio: { type: Number, default: 0 },
      difficultyGettingIn: { type: Number, default: 0 },
      difficultyGettingDrink: { type: Number, default: 0}
    }
    
  },
  { timestamps: true }
);

module.exports = mongoose.model('Business', businessSchema);

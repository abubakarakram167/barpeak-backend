const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const businessSchema = new Schema(
  {
    placeId: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
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
    profile: {
      expensive: {
        type: Boolean,
        default: true,
        required: true
      },
      crowded: {
        type: Boolean,
        default: true,
        required: true
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Business', businessSchema);

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
      default: "here it is default short"
    },
    longDescription: {
      type: String,
      default: "here it is default long"
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

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = mongoose.Schema(
  { 
    asset_id: String,
    public_id: String,
    version: Number,
    version_id: String,
    signature: String,
    width: Number,
    height: Number,
    format: String,
    resource_type: String,
    created_at: String,
    tags: [],
    bytes: Number,
    type: String,
    etag: String,
    placeholder: Boolean,
    url: String,
    secure_url: String,
    original_filename: String
  }

);

const businessSchema = new Schema(
  {
    placeId: {
      type: String
    },
    category: [{  
      type: Schema.Types.ObjectId,
      ref: 'category'
    }]
    ,
    name: {
      type: String
    },
    ageInterval:{
      type: String,
      default: "young"
    },
    rating: {
      fun: { type: Number },
      crowd: { type: Number },
      ratioInput: { type: Number , max: 3},
      difficultyGettingIn: { type: Number},
      difficultyGettingDrink: { type: Number},
      creationAt: String
    },
    allRating: [
      {
        fun: { type: Number },
        crowd: { type: Number },
        ratioInput: { type: Number},
        difficultyGettingIn: { type: Number},
        difficultyGettingDrink: { type: Number},
        creationAt: String
      }
    ],
    totalUserCountRating:{
      type: Number,
      default: 0
    },
    accumulatedRating: {
      fun: { type: Number, default: 0 },
      crowd: { type: Number, default: 0 },
      ratioInput: { type: Number, default: 0 },
      difficultyGettingIn: { type: Number, default: 0 },
      difficultyGettingDrink: { type: Number, default: 0}
    },
    photoReference:{
      type: String
    },
    googleBusiness: {
      type: Schema.Types.ObjectId,
      ref: 'GoogleBusiness'
    },
    addedByAdmin: {
      type: Boolean,
      default: false
    },
    location: { 
      type: { type: String },
      coordinates: []
    },
    customBusiness: {
      type: Boolean,
      default: false
    },
    customData: {
      address: String,
      phoneNo: String,
      rating: Number,
      latitude: Number,
      longitude: Number,
      opening_hours: {
        open_now: String,
        periods: [
          {
            close: {
              day: String,
              time: String
            },
            open: {
              day: String,
              time: String
            }
          }
        ],
        weekday_text: []
      }
    },
    uploadedPhotos: [photoSchema]
  },
  { timestamps: true }
);

businessSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Business', businessSchema);

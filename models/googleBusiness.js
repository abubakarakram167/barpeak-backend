const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const googleBusinessSchema = new Schema(
  {
    business_status: {
      type: String
    },
    address_components:[
      {
        long_name: String,
        short_name: String,
        types: []
      }
    ],
    adr_address: String,
    business_status: String,
    formatted_address: String,
    formatted_phone_number: String,
    international_phone_number: String,
    geometry:{
      location:{
        lat:{
          type: Number
        },
        lng:{
          type: Number
        },
      },
      viewport:{
        northeast:{
          lat:{
            type: Number
          },
          lng:{
            type: Number
          }
        },
        southwest:{
          lat: {
            type: Number
          },
          lng:{
            type: Number
          }
        }
      }
    },
    icon: {
      type: String
    },
    name: {
      type: String
    },
    permanently_closed: {
      type: Boolean
    },
    photos:[
      { 
        height: Number,
        html_attributions: [],
        photo_reference: String,
        width: Number
      }
    ],
    place_id: {
      type: String
    },
    plus_code:{
      compound_code: String,
      global_code: String
    },
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
    },
    rating: Number,
    reference: String,
    reviews: [
      {
        author_name: String,
        author_url: String,
        language: String,
        profile_photo_url: String,
        rating: Number,
        relative_time_description: String,
        text: String,
        time: Number
      }
    ],
    types: [ ],
    user_ratings_total: Number,
    vicinity: String,
    user_ratings_total: Number,
    url: String,
    utc_offset: Number,

  },
  { timestamps: true }
);

module.exports = mongoose.model('GoogleBusiness', googleBusinessSchema);

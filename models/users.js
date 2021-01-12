const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  firstName: {
    type: String,
    required: true
  },
  lastName:{
    type: String,
    required: true
  },
  accountType:{
    type: String,
    required: true
  },
  radius:{
    type: String,
    required: true,
    default: 5000
  },
  profilePic: {
    type: String,
  },
  dob: {
    type: String,
    required: true
  },
  gender: {
    type: String
  },
  favoritesEstablishments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      default: null
    }
  ],
  phoneNumber: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  appleId: {
    type: String
  }
});

module.exports = mongoose.model('User', userSchema);

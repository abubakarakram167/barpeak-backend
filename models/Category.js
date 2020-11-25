const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  barType: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model('category', categorySchema);

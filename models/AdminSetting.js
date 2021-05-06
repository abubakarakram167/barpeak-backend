const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSettingSchema = new Schema({
  
  scheduleStartTime: {
    type: String,
    required: true
  }, 
  scheduleEndTime: {
    type: String,
    required: true
  },
  startJobId: String,
  endJobId: String,
  rating: {
    fun: { 
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3 
    },
    crowd: { 
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 2  
    },
    ratioInput: { 
      type: Number,
      required: true,
      min: 1,
      max: 3,
      default: 1 
    },
    difficultyGettingIn: { 
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 1 
    },
    difficultyGettingDrink: { 
      type: Number,
      required: true,
      min: 1,
      max: 4,
      default: 1   
    }
  },
  noOfUsersUntilShowDefault: {
   type: Number,
   required: true 
  },
  isCurrentDefault: {
    type: Boolean,
    default: true
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  isScheduleApply: {
    type: Boolean,
  },
  vibeCategoryPinsColor: [],
  noOfscheduleEventInAWeek: []
});

module.exports = mongoose.model('adminSetting', adminSettingSchema);

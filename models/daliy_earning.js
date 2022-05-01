
const mongoose = require('mongoose')


const dailyEarningSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  date : {
    type: Date,
    default: Date.now
  }
});

dailyEarningSchema.virtual('id', function() {
  return this._id.toString();
})


dailyEarningSchema.set('toJSON', {
  virtuals:true
})


module.exports = mongoose.model('DailyEarning', dailyEarningSchema)


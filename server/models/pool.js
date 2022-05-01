const mongoose = require('mongoose');


const poolSchema = new mongoose.Schema({
   total : {
    type: Number,
    default: 0,
   },
   controlDate: {
    type: Date,
    default: Date.now,
   } 
});



poolSchema.virtual('id', function() {
  return this._id.toHexString();
})

poolSchema.set('toJSON', {
    virtuals:true
})


exports.Pool = mongoose.model('Pool', poolSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  hashPassword: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  money: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  exp: {
    type: Number,
    default: 0,
  },
  gender: {
    type: String,
    default : ''
  } ,
  age: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
  city: {
    type: String,
    default: '',
  },
  state: {
    type: String,
  },
  country: {
    type: String,
    default: '',
  },
  picture: {
    type: String,
    default: '',
  },
  daily_earnings : {
    type: Number,
    default: 0,
  }

});

userSchema.virtual('id', function() {
  return this._id.toHexString();
})

userSchema.set('toJSON', {
    virtuals:true
})

exports.User = mongoose.model('User', userSchema);

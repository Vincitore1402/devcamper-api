/* eslint-disable no-underscore-dangle, no-useless-escape */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const { generateToken, hashToken } = require('../utils/common.utils');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function _handler(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);

  return next();
});

UserSchema.methods.getSignedJwtToken = function _handler() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

UserSchema.methods.matchPasswords = async function _handler(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function _handler() {
  const resetToken = generateToken();

  this.resetPasswordToken = hashToken({ token: resetToken });

  this.resetPasswordExpire = moment
    .utc()
    .add(10, 'minutes')
    .toDate();

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);

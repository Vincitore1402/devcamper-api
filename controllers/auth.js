const { pipe, get, pick } = require('lodash/fp');
const moment = require('moment');

const User = require('../models/User');

const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: moment
      .utc()
      .add(process.env.JWT_COOKIE_EXPIRE, 'days')
      .toDate(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};

/**
 * @desc Register user
 * @route POST /api/v1/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const data = pipe(
    get('body'),
    pick(['name', 'email', 'password', 'role'])
  )(req);

  const user = await User.create(data);

  return sendTokenResponse(user, 200, res);
});

/**
 * @desc Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = pipe(
    get('body'),
    pick(['email', 'password'])
  )(req);

  if (!email || !password) {
    return next(
      new ErrorResponse('Please provide an email and password', 400)
    );
  }

  const user = await User
    .findOne({ email })
    .select('+password');

  if (!user) {
    return next(
      new ErrorResponse('Invalid credentials', 401)
    );
  }

  const isMatch = await user.matchPasswords(password);

  if (!isMatch) {
    return next(
      new ErrorResponse('Invalid credentials', 401)
    );
  }

  return sendTokenResponse(user, 200, res);
});

/**
 * @desc Get current logged in user
 * @route GET /api/v1/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res) => {
  const userId = get('user._id', req);

  const user = await User.findOne({ _id: userId });

  return res
    .status(200)
    .json({
      success: true,
      data: user
    });
});

module.exports = {
  register,
  login,
  getMe
};

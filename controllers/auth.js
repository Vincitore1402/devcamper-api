const { pipe, get, pick } = require('lodash/fp');
const moment = require('moment');

const User = require('../models/User');

const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/error-response');
const { sendEmail } = require('../utils/email.utils');
const { hashToken } = require('../utils/common.utils');
const { getUserId } = require('../utils/auth.utils');

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
 * @desc Log user out / clear cookie
   @route GET /api/v1/auth/logout
   @access Public
 */
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: moment
      .utc()
      .add(10, 'minutes')
      .toDate(),
    httpOnly: true,
  });

  return res
    .status(200)
    .json({
      success: true,
      data: {}
    });
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

/**
 * @desc Update user details
   @route PUT /api/v1/auth/update-details
   @access Private
 */
const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = pipe(
    get('body'),
    pick(['name', 'email'])
  )(req);

  const user = await User.findOneAndUpdate(
    { _id: getUserId(req) },
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  return res
    .status(200)
    .json({
      success: true,
      data: user
    });
});

/**
 * @desc Update password
   @route PUT /api/v1/auth/updatepassword
   @access Private
 */
const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User
    .findOne({ _id: getUserId(req) })
    .select('+password');

  const currentPassword = get('body.currentPassword', req);

  const isPasswordsMatch = await user.matchPasswords(currentPassword);

  if (!isPasswordsMatch) {
    return next(
      new ErrorResponse('Password is incorrect', 401)
    );
  }

  user.password = get('body.newPassword', req);

  await user.save();

  return sendTokenResponse(user, 200, res);
});

/**
 * @desc Forgot password
 * @route POST /api/v1/auth/forgot-password
 * @access Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const email = get('body.email', req);

  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new ErrorResponse('There is no user with that email', 404)
    );
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

  const message = `You are receiving this email because you has requested the reset of a password. Please make a PUT request to: 
  
  ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    return res
      .status(200)
      .json({
        success: true,
        data: 'Email sent'
      });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorResponse('Email could not be sent', 500)
    );
  }
});

/**
 * @desc Reset password
   @route PUT /api/v1/auth/reset-password/:reset-token
   @access Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = pipe(
    get('params.resetToken'),
    token => hashToken({ token })
  )(req);

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(
      new ErrorResponse('Invalid token', 400)
    );
  }

  user.password = get('body.password', req);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return sendTokenResponse(user, 200, res);
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword
};

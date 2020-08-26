const { pipe, get, split } = require('lodash/fp');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const asyncHandler = require('./async');
const ErrorResponse = require('../utils/error-response');

const getToken = pipe(
  split(' '),
  get('[1]')
);

const protect = asyncHandler(async (req, res, next) => {
  const authorization = get('headers.authorization', req);

  const token = authorization && authorization.startsWith('Bearer')
    ? getToken(authorization)
    : get('cookies.token', req);

  if (!token) {
    return next(
      new ErrorResponse('Not authorized to access this route', 401)
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findOne({ _id: decoded.id });

    return next();
  } catch (err) {
    return next(
      new ErrorResponse('Not authorized to access this route', 401)
    );
  }
});

const authorize = (...roles) => asyncHandler(async (req, res, next) => {
  const userRole = get('user.role', req);

  if (!roles.includes(userRole)) {
    return next(
      new ErrorResponse(`User with role ${userRole} is not authorized to access this route`, 403)
    );
  }

  return next();
});

module.exports = {
  protect,
  authorize
};

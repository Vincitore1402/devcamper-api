const { pipe, get, split } = require('lodash/fp');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');

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

    next();
  } catch (err) {
    return next(
      new ErrorResponse('Not authorized to access this route', 401)
    );
  }
});

module.exports = {
  protect
};

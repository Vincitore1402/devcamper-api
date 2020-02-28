const { pipe, map, values, get, pick } = require('lodash/fp');
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = pick([
    'name', 'code', 'message', 'statusCode'
  ], err);

  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  if (err.code === 11000) {
    const message = `Duplicate field value`;
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = pipe(
      get('errors'),
      values,
      map('message')
    )(err);

    error = new ErrorResponse(message, 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;

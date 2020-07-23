const { pipe, get, pick } = require('lodash/fp');

const User = require('../models/User');

const asyncHandler = require('../middleware/async');

/**
 * @desc Register user
 * @route POST /api/v1/auth/register
 * @access    Public
 */
const register = asyncHandler(async (req, res) => {
  const data = pipe(
    get('body'),
    pick(['name', 'email', 'password', 'role'])
  )(req);

  await User.create(data);

  return res.status(200)
    .json({
      success: true
    });
});

module.exports = {
  register
};

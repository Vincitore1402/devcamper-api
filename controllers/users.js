const { get } = require('lodash/fp');

const User = require('../models/User');

const asyncHandler = require('../middleware/async');

const getUserId = get('params.id');

/**
 * @desc Get all users
   @route GET /api/v1/users
   @access Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => res
  .status(200)
  .json(res.advancedResults));

/**
 * @desc Get single user
   @route GET /api/v1/users/:id
   @access Private/Admin
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: getUserId(req) });

  return res
    .status(200)
    .json({
      success: true,
      data: user
    });
});

/**
 * @desc Create user
   @route POST /api/v1/users
   @access Private/Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);

  return res
    .status(201)
    .json({
      success: true,
      data: user
    });
});

/**
 * @desc Update user
   @route PUT /api/v1/users/:id
   @access Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: getUserId(req) },
    req.body,
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
 * @desc Delete user
   @route DELETE /api/v1/users/:id
   @access Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(
    getUserId(req)
  );

  return res
    .status(200)
    .json({
      success: true,
      data: {}
    });
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser
};

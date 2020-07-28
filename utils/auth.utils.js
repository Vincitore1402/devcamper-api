const { get } = require('lodash/fp');

const getUserId = get('user.id');

const getRole = get('user.role');

const getUser = get('user');

module.exports = {
  getUserId,
  getRole,
  getUser
};

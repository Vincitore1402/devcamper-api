const crypto = require('crypto');

const generateToken = (numberOfBytes = 20) => crypto
  .randomBytes(numberOfBytes)
  .toString('hex');

const hashToken = (
  { token, alg = 'sha256' } = {}
) => crypto
  .createHash(alg)
  .update(token)
  .digest('hex');

module.exports = {
  generateToken,
  hashToken
};

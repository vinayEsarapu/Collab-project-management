const crypto = require("crypto");

/**
 * Generate a cryptographically secure random token.
 *
 * The raw token is sent to the user.
 * Only its SHA-256 hash is stored in MongoDB.
 */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash a token before storing/comparing it.
 */
const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

module.exports = {
  generateSecureToken,
  hashToken
};
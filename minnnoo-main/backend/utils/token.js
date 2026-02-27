const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRY = "90s";   // 1.5 minutes
const REFRESH_TOKEN_EXPIRY = "180s"; // 3 minutes

exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

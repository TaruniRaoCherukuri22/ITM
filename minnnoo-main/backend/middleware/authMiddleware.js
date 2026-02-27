// import jwt from "jsonwebtoken";
// import User from "../models/User.js";


// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// // Verify JWT token
// export const verifyToken = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, "your_jwt_secret");
//     req.user = await User.findById(decoded.id);
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// // Only HR can access
// export const verifyHR = (req, res, next) => {
//   if (req.user.role !== "hr") {
//     return res.status(403).json({ message: "Access denied: HR only" });
//   }
//   next();
// };
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.accessToken; // 👈 KEY LINE

  if (!token) {
    return res.status(401).json({ message: "No token, unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
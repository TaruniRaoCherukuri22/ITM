



const express = require("express");
const router = express.Router();
const { signup, login, refreshToken,getProfile, updateProfile } = require("../controllers/authController");
const multer = require("multer");

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder must exist
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // keep original name
  },
});
const upload = multer({ storage });

// Auth routes
router.post("/signup", signup);
router.post("/login", login);

router.post("/refresh-token", refreshToken);
// Profile routes
router.get("/profile/:id", getProfile);
router.put("/profile/:id", upload.single("resume"), updateProfile);


router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "90s" } // 1.5 min
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Refresh token expired" });
  }
});

module.exports = router;

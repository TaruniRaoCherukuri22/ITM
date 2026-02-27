const express=require('express')
const User=require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } }
    ]
  }).select("name email _id");

  res.json(users);
});


// POST /api/users/follow/:targetUserId
router.post("/follow/:targetId", authMiddleware, async (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = req.params.targetId;

  if (currentUserId === targetUserId)
    return res.status(400).json({ message: "Cannot follow yourself" });

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    // UNFOLLOW
    currentUser.following.pull(targetUserId);
    targetUser.followers.pull(currentUserId);
  } else {
    // FOLLOW
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
  }

  await currentUser.save();
  await targetUser.save();

  res.json({
    following: !isFollowing,
    followersCount: targetUser.followers.length
  });
});


// GET /api/users/follow-status/:targetUserId
router.get("/follow-status/:targetId", authMiddleware, async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  const isFollowing = currentUser.following.includes(req.params.targetId);
  res.json({ isFollowing });
});

module.exports= router;
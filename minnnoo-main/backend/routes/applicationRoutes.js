const express = require("express");
const router = express.Router();
const { applyJob } = require("../controllers/applicationController");
const Application = require("../models/Application");
// POST /api/applications
router.post("/", applyJob);
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // find applications for the user
    const applications = await Application.find({ userId }).select("vacancyId").lean();
    // Always return array
    res.json(Array.isArray(applications) ? applications : []);
  } catch (err) {
    console.error("Fetch applied jobs error:", err);
    res.status(500).json([]); // <-- return empty array on error so frontend doesn't crash
  }
});


router.get("/count-per-vacancy", async (req, res) => {
  try {
    const counts = await Application.aggregate([
      {
        $group: {
          _id: "$vacancyId",
          appliedCount: { $sum: 1 }
        }
      }
    ]);

    res.json(counts); // [{ _id: vacancyId, appliedCount: 5 }, ...]
  } catch (err) {
    console.error("Failed to get application counts", err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
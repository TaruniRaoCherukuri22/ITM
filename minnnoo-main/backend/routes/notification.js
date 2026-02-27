const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const Vacancy = require("../models/Vacancy");
router.post("/send", async (req, res) => {
  try {
    const { userId, vacancyId } = req.body;

    if (!userId || !vacancyId) {
      return res.status(400).json({ error: "Missing data" });
    }

    const vacancy = await Vacancy.findById(vacancyId);
    if (!vacancy) {
      return res.status(404).json({ error: "Vacancy not found" });
    }

    const notification = await Notification.create({
      userId,
      vacancyId,
      message: `You are a top match for "${vacancy.title}". Apply now!`
    });

    res.json(notification);
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ error: "Notification failed" });
  }
});


// router.patch("/read/:id", async (req, res) => {
//   try {
//     await Notification.findByIdAndUpdate(
//       req.params.id,
//       { read: true }
//     );

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to mark as read" });
//   }
// });

router.patch("/read/:id", async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    read: true
  });
  res.json({ success: true });
});

// router.get("/user/:userId", async (req, res) => {
//   try {
//     const notifications = await Notification.find({
//       userId: req.params.userId,
//       read: false        
//     })
//       .populate("vacancyId", "title")
//       .sort({ createdAt: -1 });

//     res.json(notifications);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch notifications" });
//   }
// });

router.get("/user/:userId", async (req, res) => {
  const { unreadOnly } = req.query;

  const filter = { userId: req.params.userId };
  if (unreadOnly === "true") filter.read = false;

  const notifications = await Notification.find(filter)
    .populate("vacancyId", "title")
    .sort({ createdAt: -1 });

  res.json(notifications);
});

module.exports = router;

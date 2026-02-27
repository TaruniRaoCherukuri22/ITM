
const express = require("express");
const router = express.Router();
const Vacancy = require("../models/Vacancy");


router.get("/:vacancyId/top-employees", async (req, res) => {
  try {
    const { vacancyId } = req.params;

    const vacancy = await Vacancy.findById(vacancyId)
      .populate("atsScores.userId", "name email skills resume")
      .populate("aiScores.userId", "name email skills");

    if (!vacancy)
      return res.status(404).json({ error: "Vacancy not found" });

    /* -------- MERGE ATS + AI SCORES -------- */
    const employeesMap = new Map();

    // ATS scores
    vacancy.atsScores.forEach(a => {
      employeesMap.set(a.userId._id.toString(), {
        user: a.userId,
        atsScore: a.score,
        aiScore: null,
        summary: null
      });
    });

    // AI scores (overwrite ATS if exists)
    vacancy.aiScores.forEach(a => {
      const key = a.userId._id.toString();
      if (employeesMap.has(key)) {
        employeesMap.get(key).aiScore = a.score;
        employeesMap.get(key).summary = a.summary;
      }
    });

    /* -------- SORT BY ATS SCORE -------- */
    const topEmployees = Array.from(employeesMap.values())
      .sort((a, b) => b.atsScore - a.atsScore)
      .slice(0, 5); // 👈 TOP 5 employees

    res.json(topEmployees);

  } catch (err) {
    console.error("Top employees error:", err);
    res.status(500).json({ error: "Failed to fetch top employees" });
  }
});


module.exports=router;
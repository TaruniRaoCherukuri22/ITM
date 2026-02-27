// import express from "express";
// import { createVacancy, getVacancies } from "../controllers/hrController.js";
// import { verifyToken, verifyHR } from "../middleware/authMiddleware.js";


const express = require("express");
const router = express.Router();
const { createVacancy, getVacancies, updateVacancy } = require("../controllers/hrController");
const Vacancy = require("../models/Vacancy");
const Application = require("../models/Application");
// HR creates a vacancy
router.post("/vacancies", createVacancy);

// Update a vacancy
router.put("/vacancies/:id", updateVacancy);

// Employees can view vacancies
router.get("/vacancies", getVacancies);

router.delete("/vacancies/:id", async (req, res) => {
  try {
    await Vacancy.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});
//single vacancy
router.get("/vacancies/:id", async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ message: "Vacancy not found" });
    }
    res.json(vacancy);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }

});



router.get("/vacancies/:vacancyId/candidates", async (req, res) => {
  try {
    const { vacancyId } = req.params;

    // 1️ Get applications for this vacancy
    const applications = await Application.find({ vacancyId });

    if (!applications.length) {
      return res.json([]);
    }

    // 2️Extract applied userIds
    const userIds = applications.map(app => app.userId);

    // 3️ Get vacancy scores
    const vacancy = await Vacancy.findById(vacancyId)
      .populate("atsScores.userId", "name email")
      .populate("aiScores.userId", "name email");

    if (!vacancy) {
      return res.status(404).json({ error: "Vacancy not found" });
    }

    // 4️Build candidate list (ONLY APPLIED USERS)
    const candidates = userIds.map(userId => {
      const ats = vacancy.atsScores.find(
        s => s.userId._id.toString() === userId.toString()
      );

      const ai = vacancy.aiScores.find(
        s => s.userId._id.toString() === userId.toString()
      );

      return {
        userId,
        name: ats?.userId?.name || ai?.userId?.name,
        email: ats?.userId?.email || ai?.userId?.email,
        atsScore: ats?.score ?? 0,
        aiScore: ai?.score ?? null,
        matchedSkills: ai?.matchedSkills || [],
        missingSkills: ai?.missingSkills || [],
        summary: ai?.summary || "",
        status:
          vacancy.applications.find(app => app.userId.toString() === userId.toString())
            ?.status || "PENDING"
      };
    });

    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});


router.post("/vacancies/:vacancyId/candidates/:userId/status", async (req, res) => {
  try {
    const { vacancyId, userId } = req.params;
    const { status } = req.body;

    const vacancy = await Vacancy.findById(vacancyId);
    if (!vacancy) return res.status(404).json({ message: "Vacancy not found" });

    const appIndex = vacancy.applications.findIndex(a => a.userId.toString() === userId.toString());
    if (appIndex > -1) {
      vacancy.applications[appIndex].status = status;
    } else {
      vacancy.applications.push({ userId, status });
    }

    await vacancy.save();
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});


module.exports = router;




const Vacancy = require("../models/Vacancy");
const User = require("../models/User");
const fetch = require("node-fetch");
const axios = require("axios");

const { analyzeVacancyForUser } = require("../routes/aiRoutes");



exports.createVacancy = async (req, res) => {
  try {
    // 1️Save vacancy
    const vacancy = new Vacancy(req.body);
    await vacancy.save();

    // 2️Respond immediately to HR
    res.status(201).json({
      message: "Vacancy created. AI analysis started in background.",
      vacancy
    });


    setImmediate(async () => {
      const users = await User.find({
        resume: { $exists: true, $ne: null }
      }).select("_id");

      for (const user of users) {
        try {
          // AI SCORE
          // await axios.post(
          //   "http://localhost:5000/api/ai/match-score",
          //   {
          //     userId: user._id.toString   const accessToken = generateAccessToken(user);
          //     const refreshToken = generateRefreshToken(user);

          //     console.log(" ACCESS TOKEN:", accessToken);
          // console.log(" REFRESH TOKEN:", refreshToken);(),
          //     vacancyId: vacancy._id.toString()
          //   }
          // );


          await axios.post(
            "http://localhost:5000/api/ats/analyze-one",
            {
              userId: user._id.toString(),
              vacancyId: vacancy._id.toString()
            }
          );

          await new Promise(r => setTimeout(r, 1200));
        } catch (err) {
          console.error(
            "Analysis failed:",
            user._id.toString(),
            err.message
          );
        }
      }

      console.log("AI + ATS completed for vacancy:", vacancy._id);
    });


  } catch (err) {
    console.error("Create vacancy error:", err);
    res.status(500).json({ message: "Failed to create vacancy" });
  }
};

// const Vacancy = require("../models/Vacancy");

// Update vacancy
exports.updateVacancy = async (req, res) => {
  try {
    const vacancy = await Vacancy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vacancy) return res.status(404).json({ message: "Vacancy not found" });
    res.json({ message: "Vacancy updated successfully", vacancy });
  } catch (err) {
    console.error("Update vacancy error:", err);
    res.status(500).json({ message: "Failed to update vacancy" });
  }
};

// Get all vacancies (for employees)
exports.getVacancies = async (req, res) => {
  try {
    const vacancies = await Vacancy
      .find()
      .sort({ createdAt: -1 }) // latest first
      .lean();                //  important for frontend usage
    // We return an array to guarantee a consistent API response,
    // so the frontend can safely iterate using .map() without crashing,
    // even when there is no data or unexpected backend behavior.
    // Always return array
    res.json(Array.isArray(vacancies) ? vacancies : []);
  } catch (err) {
    console.error("Get vacancies error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

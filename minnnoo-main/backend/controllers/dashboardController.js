// controllers/dashboardController.js
// const Vacancy = require("../models/Vacancy");
// const ResumeScore = require("../models/ResumeScore");

// exports.getDashboardVacancies = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const vacancies = await Vacancy.find().lean();
//     const scores = await ResumeScore.find({ userId });

//     const scoreMap = {};
//     scores.forEach(s => {
//       scoreMap[s.vacancyId] = s.score;
//     });

//     const result = vacancies.map(v => ({
//       ...v,
//       matchScore: scoreMap[v._id] || 0
//     }));

//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ message: "Dashboard error" });
//   }
// };



const ResumeScore = require("../models/ResumeScore");
const Vacancy = require("../models/Vacancy");

exports.getDashboardVacancies = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;

    // Only high matches
    const scores = await ResumeScore.find({
      userId,
      score: { $gte: 70 }
    });

    res.json({
      count: scores.length,
      vacancies: scores
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};

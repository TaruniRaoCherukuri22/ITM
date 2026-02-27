const Vacancy = require("../models/Vacancy");
const ResumeScore = require("../models/ResumeScore");

exports.uploadResumeAndScore = async (req, res) => {
  try {
    const { resumeText } = req.body;
    const userId = req.user.id;

    const vacancies = await Vacancy.find();

    for (const vacancy of vacancies) {
      const score = calculateScore(resumeText, vacancy.description);

      await ResumeScore.findOneAndUpdate(
        { userId, vacancyId: vacancy._id },
        { score },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Resume uploaded & all jobs scored" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Scoring failed" });
  }
};

function calculateScore(resume, jd) {
  const resumeWords = resume.toLowerCase().split(/\s+/);
  const jdWords = jd.toLowerCase().split(/\s+/);

  const match = resumeWords.filter(w => jdWords.includes(w));
  return Math.min(100, Math.round((match.length / jdWords.length) * 100));
}


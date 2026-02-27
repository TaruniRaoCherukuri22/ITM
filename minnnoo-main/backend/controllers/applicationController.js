const Application = require("../models/Application");
const Vacancy = require("../models/Vacancy");




// Submit a job application
exports.applyJob = async (req, res) => {
  const { userId, vacancyId, coverLetter } = req.body;

  if (!userId || !vacancyId) {
    return res.status(400).json({ error: "Missing userId or vacancyId" });
  }

  try {
    // Check if vacancy exists
    const vacancy = await Vacancy.findById(vacancyId);
    if (!vacancy) return res.status(404).json({ error: "Vacancy not found" });

    // Prevent duplicate applications
    const existing = await Application.findOne({ userId, vacancyId });
    if (existing) return res.status(400).json({ error: "Already applied" });

    const application = new Application({ userId, vacancyId, coverLetter });
    await application.save();

    // Also add to vacancy's applications list for easier status management
    const appIndex = vacancy.applications.findIndex(a => a.userId.toString() === userId.toString());
    if (appIndex === -1) {
      vacancy.applications.push({ userId, status: "PENDING" });
      await vacancy.save();
    }

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (err) {
    console.error("Apply job error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  vacancyId: { type: mongoose.Schema.Types.ObjectId, ref: "Vacancy", required: true },
  coverLetter: { type: String },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Application", applicationSchema);
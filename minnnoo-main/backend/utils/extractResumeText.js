// const fs = require("fs");
// const pdf = require("pdf-parse");

// async function extractResumeText(filePath) {
//   try {
//     if (!fs.existsSync(filePath)) {
//       console.warn("Resume file not found:", filePath);
//       return "";
//     }
//     const dataBuffer = fs.readFileSync(filePath);
//     const data = await pdf(dataBuffer);
//     return data.text || "";
//   } catch (err) {
//     console.error("Error reading PDF:", err);
//     return "";
//   }
// }c
// backend/utils/extractResumeText.js
// const fs = require("fs");
// const path = require("path");
// const pdfParse = require("pdf-parse"); // npm install pdf-parse

// const extractResumeText = async (resumePath) => {
//   const absolutePath = path.join(process.cwd(), resumePath);
//   console.log("Absolute resume path:", absolutePath);

//   if (!fs.existsSync(absolutePath)) {
//     throw new Error("Resume file not found at: " + absolutePath);
//   }

//   const buffer = fs.readFileSync(absolutePath);

//   // Safe pdfParse call (works with different versions)
//   const pdf = typeof pdfParse === "function" ? pdfParse : pdfParse.default;
//   const data = await pdf(buffer);

//   return data.text || "";
// };

// module.exports = { extractResumeText };




// // utils/extractResumeText.js
// const fs = require("fs");
// const path = require("path");
// let pdfParse = require("pdf-parse");

// // Handle ES module default export
// if (pdfParse.default && typeof pdfParse.default === "function") {
//   pdfParse = pdfParse.default;
// }

// const extractResumeText = async (resumePath) => {
//   // Remove leading slash if present
//   const cleanPath = resumePath.replace(/^\/+/, "");
//   const absolutePath = path.join(process.cwd(), cleanPath);

//   console.log("Absolute resume path:", absolutePath);

//   if (!fs.existsSync(absolutePath)) {
//     throw new Error("Resume file not found at: " + absolutePath);
//   }

//   const buffer = fs.readFileSync(absolutePath);

//   if (typeof pdfParse !== "function") {
//     throw new Error("pdfParse is not a function. Current value: " + pdfParse);
//   }

//   const data = await pdfParse(buffer);
//   return data.text || "";
// };

// module.exports = { extractResumeText };



// const fs = require("fs");
// const path = require("path");
// const pdfParse = require("pdf-parse");

// /**
//  * Extract text from a PDF resume
//  * @param {string} resumePath - Path stored in DB, e.g., "uploads/resume.pdf"
//  * @returns {Promise<string>} - Extracted text
//  */
// const extractResumeText = async (resumePath) => {
//   if (!resumePath) throw new Error("No resume path provided");

//   // Clean leading slashes
//   const cleanPath = resumePath.replace(/^\/+/, "");
//   const absolutePath = path.join(process.cwd(), cleanPath);

//   if (!fs.existsSync(absolutePath)) {
//     throw new Error("Resume file not found at " + absolutePath);
//   }

//   // Read PDF file
//   const buffer = fs.readFileSync(absolutePath);

//   // Extract text using pdf-parse
//   const data = await pdfParse(buffer);

//   // Return trimmed text
//   return data.text ? data.text.trim() : "";
// };

// module.exports = { extractResumeText };



const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const extractResumeText = async (resumePath) => {
  if (!resumePath) throw new Error("No resume path provided");

  const absolutePath = path.join(process.cwd(), resumePath);
  if (!fs.existsSync(absolutePath)) throw new Error("Resume not found at " + absolutePath);

  const buffer = fs.readFileSync(absolutePath);
  const data = await pdfParse(buffer);
  return data.text ? data.text.trim() : "";
};

module.exports = { extractResumeText };

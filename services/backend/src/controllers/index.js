const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const analyzeImage = require("../services/openaiVision");

const uploadbarcode = async (req, res) => {
  try {
    if (req.files != null && req.files.barcode != null) {
      const jobId = uuidv4();
      const filename = jobId + "." + req.files.barcode.name.split(".").pop();
      const filepath = "./uploads/barcode/" + filename;
      await req.files.barcode.mv(filepath);
      return res.status(200).json({ jobId });
    }
    return res.status(400).json({
      message: "file missing",
    });
  } catch (error) {
    return res.status(400).json({
      message: "upload error",
    });
  }
};


const uploadfoodlabel = async (req, res) => {
  try {
    if (req.files != null && req.files.foodlabel != null) {
      const jobId = uuidv4();
      const filename = jobId + "." + req.files.foodlabel.name.split(".").pop();
      const filepath = "./uploads/foodlabel/" + filename;
      await req.files.foodlabel.mv(filepath);
      return res.status(200).json({ jobId });
    }
    return res.status(400).json({
      message: "file missing",
    });
  } catch {
      return res.status(400).json({
      message: "upload error",
    });
  }
}


const dbTest = async (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "MySQL connected successfully " });
  });
}

const analyzeFoodLabel = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId required" });
    }

    const filepath = "./uploads/foodlabel/" + jobId + ".png";

    const result = await analyzeImage(filepath);

    return res.json({
      success: true,
      jobId,
      data: result,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "analysis failed" });
  }
};


module.exports = { 
    uploadbarcode,
    uploadfoodlabel,
    dbTest,
    analyzeFoodLabel
  };

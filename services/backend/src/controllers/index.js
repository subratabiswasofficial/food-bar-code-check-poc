const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const uploadbarcode = async (req, res) => {
  try {
    if (req.files != null && req.files.barcode != null) {
      const jobId = uuidv4();
      const filename = jobId + "." + req.files.barcode.name.split(".").pop();
      const filepath = "./uploads/barcode/" + filename;
      await req.files.barcode.mv(filepath);
      return res.status(200).json({ jobId: uuidv4() });
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
      return res.status(200).json({ jobId: uuidv4() });
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

module.exports = { 
    uploadbarcode,
    uploadfoodlabel,
    dbTest
  };

const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const analyzeImage = require("../services/openaiVision");
const cacheService = require("../services/cache.service");

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
  const cacheKey = "db:test";

  const cached = await cacheService.getCache(cacheKey);
  if (cached) {
    return res.json({
      source: "redis",
      ...cached,
    });
  }

  const [rows] = await db.query("SELECT 1 AS result");

  const response = {
    success: true,
    mysql: "connected",
    result: rows,
  };

  await cacheService.setCache(cacheKey, response, 30);

  res.json(response);
};


const analyzeFoodLabel = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId required" });
    }

    // 🔑 Redis cache key
    const cacheKey = `foodlabel:${jobId}`;

    // 1️⃣ Redis check
    const cachedResult = await cacheService.getCache(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        jobId,
        source: "redis",
        data: cachedResult,
      });
    }

    // 2️⃣ File path
    const filepath = "./uploads/foodlabel/" + jobId + ".png";

    // 3️⃣ Expensive OpenAI call
    const result = await analyzeImage(filepath);

    // 4️⃣ Redis me store (10 min)
    await cacheService.setCache(cacheKey, result, 600);

    return res.json({
      success: true,
      jobId,
      source: "openai",
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

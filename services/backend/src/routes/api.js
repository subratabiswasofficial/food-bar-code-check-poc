const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {
  uploadbarcode,
  uploadfoodlabel,
  dbTest,
  analyzeFoodLabel
} = require("../controllers");


router.post("/upload/barcode", uploadbarcode);
router.post("/upload/food-label", uploadfoodlabel);
router.get("/db-test", dbTest);
router.post("/analyze/foodlabel", analyzeFoodLabel);

router.get("/job/status/:jobId", (req, res) => {
  res.json({
    jobId: req.params.jobId,
    status: true,
  });
});

module.exports = router;

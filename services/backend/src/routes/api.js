const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {
  uploadbarcode,
  uploadfoodlabel,
  dbTest
} = require("../controllers");


router.post("/upload/barcode", uploadbarcode);
router.post("/upload/food-label", uploadfoodlabel);
router.get("/db-test", dbTest);

router.get("/job/status/:jobId", (req, res) => {
  res.json({
    jobId: req.params.jobId,
    status: true,
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const sessionMiddleware = require("../middlewares/session.middleware");

const {
  uploadbarcode,
  uploadfoodlabel,
  dbTest,
  analyzeFoodLabel
} = require("../controllers");


router.use("/auth", require("./auth.routes"));


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

router.get("/profile", sessionMiddleware, (req, res) => {
  res.json({
    message: "Protected route",
    userId: req.user.id
  });
});


module.exports = router;

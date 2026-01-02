const express = require("express");
const fileUpload = require("express-fileupload");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(express.json());
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

//upload barcode image
app.post("/upload/barcode", (req, res) => {
  if (req.files != null && req.files.barcode != null) {
    const jobId = uuidv4();
    const filename = jobId + "." + req.files.barcode.name.split(".").pop();
    req.files.barcode.mv("./uploads/barcode/" + filename, (err) => {
      if (err != null) {
        console.log(err);
        return res.status(400).json({
          message: "upload error",
        });
      }
      return res.status(200).json({ jobId });
    });
  } else {
    return res.status(400).json({
      message: "file missing",
    });
  }
});

//upload food label image
app.post("/upload/food-label", (req, res) => {
  console.log(req.files);
  if (req.files != null && req.files.foodlabel != null) {
    const jobId = uuidv4();
    const filename = jobId + "." + req.files.foodlabel.name.split(".").pop();
    req.files.foodlabel.mv("./uploads/foodlabel/" + filename, (err) => {
      if (err != null) {
        console.log(err);
        return res.status(400).json({
          message: "upload error",
        });
      }
      console.log("case 1");
      return res.status(200).json({ jobId });
    });
  } else {
    return res.status(400).json({
      message: "file missing",
    });
  }
});

//job status
app.get("/job/status/:jobId", (req, res) => {
  res.json({
    jobId: req.params.jobId,
    status: true,
  });
});

app.listen(3000, () => {
  console.log("server started");
});
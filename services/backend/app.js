const express = require("express");
const fileUpload = require("express-fileupload");
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
    const filename = req.files.barcode.name;
    req.files.barcode.mv("./uploads/" + filename, (err) => {
      if (err != null) {
        console.log(err);
        return res.status(400).json({
          message: "upload error",
        });
      }
      const jobId = Date.now();
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
    const filename = req.files.foodlabel.name;
    req.files.foodlabel.mv("./uploads/" + filename, (err) => {
      if (err != null) {
        console.log(err);
        return res.status(400).json({
          message: "upload error",
        });
      }
      console.log("case 1");
      const jobId = Date.now();
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

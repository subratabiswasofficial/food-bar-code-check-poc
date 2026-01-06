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

app.post("/upload/barcode", require('./controllers').uploadBarcode);

app.post("/upload/food-label", require('./controllers').uploadfoodlabel);



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
const express = require("express");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); 

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"], 
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload());

const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("API Running Securely");
});


const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "../ssl/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "../ssl/cert.pem")),
};


https.createServer(sslOptions, app).listen(3000, () => {
  console.log("HTTPS server started on port 3000 ");
});
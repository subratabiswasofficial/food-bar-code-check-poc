const express = require("express");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(express.json());
app.use(fileUpload());

const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});


app.listen(3000, () => {
  console.log("server started");
});
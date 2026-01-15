const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "fooddb",
  port: 3307, // 👈 SAME as Docker
});


db.connect((err) => {
  if (err) {
    console.error(" MySQL connection error:", err);
  } else {
    console.log(" MySQL connected successfully");
  }
});


module.exports = db;

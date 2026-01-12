const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "fooddb",
  port: 3307, // 👈 SAME as Docker
});

module.exports = db;

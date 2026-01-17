const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "fooddb",
  port: 3307,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = db;

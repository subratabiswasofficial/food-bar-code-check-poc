const jwt = require("jsonwebtoken");
const db = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];

    // 🔹 JWT verify
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // token invalid / expired → DB se hatao
      await db.query(
        "DELETE FROM user_sessions WHERE token = ?",
        [token]
      );
      return res.status(401).json({ message: "Session expired" });
    }

    // 🔹 DB session check
    const [sessions] = await db.query(
      "SELECT * FROM user_sessions WHERE token = ? AND user_id = ?",
      [token, decoded.userId]
    );

    if (sessions.length === 0) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // 🔹 user attach
    req.user = { id: decoded.userId };
    req.session = sessions[0];

    next();
  } catch (err) {
    console.error("SESSION MIDDLEWARE ERROR:", err);
    res.status(500).json({ message: "Auth failed" });
  }
};

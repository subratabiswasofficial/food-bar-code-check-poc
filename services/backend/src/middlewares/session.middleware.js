const jwt = require("jsonwebtoken");
const db = require("../config/db");
const {
  getCache,
  setCache,
  deleteCache
} = require("../services/cache.service");

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
      // ❌ JWT expired → DB + Redis delete
      await db.query("DELETE FROM user_sessions WHERE token = ?", [token]);
      await deleteCache(`session:${token}`);
      return res.status(401).json({ message: "Session expired" });
    }

    // 🔹 1️⃣ Redis check
    const cachedSession = await getCache(`session:${token}`);
    if (cachedSession) {
      req.session = cachedSession;
      req.user = { id: decoded.userId };
      return next();
    }

    // 🔹 2️⃣ DB check
    const [sessions] = await db.query(
      "SELECT * FROM user_sessions WHERE token = ? AND user_id = ?",
      [token, decoded.userId]
    );

    if (sessions.length === 0) {
      return res.status(401).json({ message: "Invalid session" });
    }

    const session = sessions[0];

    // 🔹 3️⃣ Redis save
    const ttl = Math.floor(
      (new Date(session.expires_at).getTime() - Date.now()) / 1000
    );

    if (ttl > 0) {
      await setCache(`session:${token}`, session, ttl);
    }

    req.user = { id: decoded.userId };
    req.session = session;

    next();
  } catch (err) {
    console.error("SESSION MIDDLEWARE ERROR:", err);
    res.status(500).json({ message: "Auth failed" });
  }
};

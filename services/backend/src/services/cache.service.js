const redisClient = require("../config/redis");

// 🔹 GET
const getCache = async (key) => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

// 🔹 SET
const setCache = async (key, value, ttl = 300) => {
  await redisClient.setEx(key, ttl, JSON.stringify(value));
};

// 🔹 DELETE
const deleteCache = async (key) => {
  await redisClient.del(key);
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
};

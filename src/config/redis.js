import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redisConnection = new IORedis(
  process.env.REDIS_URL,
  {
    maxRetriesPerRequest: null, // BullMQ requirement
    enableReadyCheck: false,    // Upstash requirement
  }
);

redisConnection.on("connect", () => {
  console.log("🟢 Connected to Upstash Redis");
});

redisConnection.on("error", (err) => {
  console.error("🔴 Redis connection error:", err);
});

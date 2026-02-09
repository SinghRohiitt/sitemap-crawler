import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const crawlQueue = new Queue("crawl-queue", {
  connection: redisConnection,
});

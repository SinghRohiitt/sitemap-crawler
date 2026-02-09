import express from "express";
import dotenv from "dotenv";
import { connectMongo } from "../config/mongo.js";
import { crawlQueue } from "../queue/crawl.queue.js";

dotenv.config();

const app = express();

// middleware
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("🚀 Sitemap Crawler API is running");
});

app.get("/test-queue", async (req, res) => {
  await crawlQueue.add("test-job", { msg: "hello from upstash" });
  res.send("✅ Job added to Upstash queue");
});
// start server AFTER mongo connects
const startServer = async () => {
  await connectMongo();

  app.listen(process.env.PORT, () => {
    console.log(`🔥 Server running on port ${process.env.PORT}`);
  });
};

startServer();

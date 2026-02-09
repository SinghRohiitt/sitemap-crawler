import express from "express";
import dotenv from "dotenv";
import { connectMongo } from "../config/mongo.js";
import { crawlQueue } from "../queue/crawl.queue.js";
import crawlRoutes from "./routes/crawl.routes.js";
import pageRoutes from "./routes/page.routes.js";
dotenv.config();

const app = express();

// middleware
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("🚀 Sitemap Crawler API is running");
});


app.use("/crawl", crawlRoutes);

app.use("/pages", pageRoutes);

app.get("/test-queue", async (req, res) => {
  await crawlQueue.add("test-job", { msg: "hello from upstash" });
  res.send("✅ Job added to Upstash queue");
});

app.get("/debug-add-job", async (req, res) => {
  await crawlQueue.add("crawl-page", {
    url: "https://example.com"
  });
  res.send("✅ debug job added");
});
// start server AFTER mongo connects
const startServer = async () => {
  await connectMongo();

  app.listen(process.env.PORT, () => {
    console.log(`🔥 Server running on port ${process.env.PORT}`);
  });
};

startServer();

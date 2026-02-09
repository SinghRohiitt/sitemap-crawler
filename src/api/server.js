import express from "express";
import dotenv from "dotenv";
import { connectMongo } from "../config/mongo.js";

dotenv.config();

const app = express();

// middleware
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("🚀 Sitemap Crawler API is running");
});

// start server AFTER mongo connects
const startServer = async () => {
  await connectMongo();

  app.listen(process.env.PORT, () => {
    console.log(`🔥 Server running on port ${process.env.PORT}`);
  });
};

startServer();

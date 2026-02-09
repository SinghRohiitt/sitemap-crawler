import { Worker } from "bullmq";
import axios from "axios";
import * as cheerio from "cheerio";
import Page from "../models/Page.model.js";
import { redisConnection } from "../config/redis.js";
import { connectMongo } from "../config/mongo.js";

// Mongo connect (worker ke liye alag process)
await connectMongo();

console.log("👷 Crawl Worker started");

// 🔹 URL normalize helper
const normalizeUrl = (url) => {
  return url.trim().replace(/\/$/, "").toLowerCase();
};

// 🔹 Worker
new Worker(
  "crawl-queue",
  async (job) => {
    const { url } = job.data;
    const pageUrl = normalizeUrl(url);

    try {
      // Mark as processing / pending
      await Page.findOneAndUpdate(
        { url: pageUrl },
        {
          url: pageUrl,
          crawlStatus: "pending",
        },
        { upsert: true },
      );

      // Fetch page HTML
      const response = await axios.get(pageUrl, {
        timeout: 15000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      const outgoingLinks = [];

      $("a[href]").each((_, el) => {
        let link = $(el).attr("href");
        if (!link) return;

        // Ignore junk links
        if (
          link.startsWith("#") ||
          link.startsWith("mailto:") ||
          link.startsWith("javascript:")
        ) {
          return;
        }

        // Relative → absolute
        if (link.startsWith("/")) {
          link = new URL(link, pageUrl).href;
        }

        if (!link.startsWith("http")) return;

        link = normalizeUrl(link);

        outgoingLinks.push({
          url: link,
          type: link.includes("edzy.ai") ? "internal" : "external",
        });
      });

      // Save success result
      await Page.findOneAndUpdate(
        { url: pageUrl },
        {
          outgoingLinks,
          outgoingCount: outgoingLinks.length,
          crawlStatus: "success",
          lastCrawledAt: new Date(),
          errorMessage: null,
        },
      );

        console.log("✅ Crawled:", pageUrl);
    } catch (error) {
      // Update failure info
      await Page.findOneAndUpdate(
        { url: pageUrl },
        {
          crawlStatus: "failed",
          retryCount: job.attemptsMade + 1,
          errorMessage: error.message,
          lastCrawledAt: new Date(),
        },
      );

      console.log("❌ Failed:", pageUrl);
      throw error; // IMPORTANT → BullMQ retry karega
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // ek saath kitne pages crawl hon
  },
);

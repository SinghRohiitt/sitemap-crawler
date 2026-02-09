import axios from "axios";
import * as cheerio from "cheerio";
import crypto from "crypto";
import Page from "../../models/Page.model.js";
import { crawlQueue } from "../../queue/crawl.queue.js";

const SITEMAP_URL = "https://www.edzy.ai/sitemap.xml";

// 🔹 helper: normalize URL
const normalizeUrl = (url) => url.trim().replace(/\/$/, "").toLowerCase();

// 🔹 helper: safe jobId
const getJobId = (url) => crypto.createHash("md5").update(url).digest("hex");

/**
 * POST /crawl/sitemap
 */
export const crawlSitemap = async (req, res) => {
  try {
    // 1️⃣ fetch sitemap
    const { data } = await axios.get(SITEMAP_URL, { timeout: 15000 });

    // 2️⃣ parse sitemap
    const $ = cheerio.load(data, { xmlMode: true });
    const urls = [];

    $("loc").each((_, el) => {
      urls.push(normalizeUrl($(el).text()));
    });

    // 3️⃣ IMMEDIATE RESPONSE (VERY IMPORTANT)
    res.json({
      message: "Sitemap crawl started",
      totalUrls: urls.length,
    });

    // 🔥 4️⃣ background enqueue (NON-BLOCKING)
    setImmediate(async () => {
      for (const url of urls) {
        try {
          await Page.findOneAndUpdate(
            { url },
            { url, crawlStatus: "pending" },
            { upsert: true },
          );

          const jobId = getJobId(url);

          await crawlQueue.add(
            "crawl-page",
            { url },
            {
              jobId,
              attempts: 3,
              backoff: {
                type: "exponential",
                delay: 5000,
              },
            },
          );
        } catch (err) {
          console.error("enqueue failed for:", url);
        }
      }
    });
  } catch (error) {
    console.error("❌ Crawl trigger failed:", error.message);
    return res.status(500).json({
      message: "Failed to start crawl",
      error: error.message,
    });
  }
};

/**
 * GET /crawl/status
 */
export const getCrawlStatus = async (req, res) => {
  try {
    const total = await Page.countDocuments();
    const success = await Page.countDocuments({ crawlStatus: "success" });
    const failed = await Page.countDocuments({ crawlStatus: "failed" });
    const pending = await Page.countDocuments({ crawlStatus: "pending" });

    return res.json({ total, success, failed, pending });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch crawl status",
      error: error.message,
    });
  }
};

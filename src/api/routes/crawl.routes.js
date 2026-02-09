import express from "express";
import {
  crawlSitemap,
  getCrawlStatus,
} from "../controllers/crawl.controller.js";

const router = express.Router();

router.post("/sitemap", crawlSitemap);
router.get("/status", getCrawlStatus);

export default router;

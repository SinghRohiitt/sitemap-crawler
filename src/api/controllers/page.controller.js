import Page from "../../models/Page.model.js";

// 🔹 helper: normalize URL
const normalizeUrl = (url) => url.trim().replace(/\/$/, "").toLowerCase();

/**
 * POST /pages/incoming
 * body: { url }
 */
export const getIncomingLinks = async (req, res) => {
  try {
    let { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "url is required" });
    }

    url = normalizeUrl(url);

    const page = await Page.findOne({ url });

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    return res.json({
      url: page.url,
      incomingLinks: page.incomingLinks,
      incomingCount: page.incomingCount,
      crawlStatus: page.crawlStatus,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /pages/outgoing
 * body: { url }
 */
export const getOutgoingLinks = async (req, res) => {
  try {
    let { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "url is required" });
    }

    url = normalizeUrl(url);

    const page = await Page.findOne({ url });

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    return res.json({
      url: page.url,
      outgoingLinks: page.outgoingLinks,
      outgoingCount: page.outgoingCount,
      crawlStatus: page.crawlStatus,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /pages/top-linked
 * body: { n }
 */
export const getTopLinkedPages = async (req, res) => {
  try {
    const { n = 5 } = req.body || {}; // 👈 SAFE FIX

    const limit = Number(n);

    const pages = await Page.find({ crawlStatus: "success" })
      .sort({ incomingCount: -1 })
      .limit(limit)
      .select("url incomingCount -_id");

    return res.json(pages);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

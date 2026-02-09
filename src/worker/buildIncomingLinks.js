import Page from "../models/Page.model.js";

export const buildIncomingLinks = async () => {
  console.log("🔄 Building incoming links...");

  const pages = await Page.find({}, { url: 1, outgoingLinks: 1 });

  const incomingMap = {};

  for (const page of pages) {
    for (const link of page.outgoingLinks) {
      if (link.type === "internal") {
        if (!incomingMap[link.url]) {
          incomingMap[link.url] = [];
        }
        incomingMap[link.url].push(page.url);
      }
    }
  }

  for (const url of Object.keys(incomingMap)) {
    await Page.findOneAndUpdate(
      { url },
      {
        incomingLinks: incomingMap[url],
        incomingCount: incomingMap[url].length,
      }
    );
  }

  console.log("✅ Incoming links built");
};

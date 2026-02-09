import mongoose from "mongoose";

// Outgoing link schema
const linkSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["internal", "external"],
      required: true,
    },
  },
  { _id: false },
);

// Main Page schema
const pageSchema = new mongoose.Schema(
  {
    // 🔑 Unique page identifier
    url: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // 🔗 Links this page points to
    outgoingLinks: {
      type: [linkSchema],
      default: [],
    },

    // 🔙 Pages which link to this page
    incomingLinks: {
      type: [String],
      default: [],
    },

    outgoingCount: {
      type: Number,
      default: 0,
    },

    incomingCount: {
      type: Number,
      default: 0,
    },

    // 🧠 Crawl lifecycle tracking
    crawlStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    retryCount: {
      type: Number,
      default: 0,
    },

    lastCrawledAt: {
      type: Date,
    },

    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Page = mongoose.model("Page", pageSchema);
export default Page;

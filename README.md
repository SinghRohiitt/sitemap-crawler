# 🕷️ Sitemap Crawler — Queue-Based Backend System

A production-ready, asynchronous sitemap crawler built using **Node.js, Express, BullMQ, Redis (Upstash), and MongoDB**.  
The system is designed to crawl large sitemaps safely using background workers, with full fault tolerance, retry handling, and link graph analysis.

---

## 🚀 Key Features

- 🔁 **Queue-based crawling** (BullMQ + Redis)
- ⚡ **Non-blocking API** (instant response)
- 👷 **Background workers** with concurrency
- 🔄 **Retry + exponential backoff**
- 🧠 **Idempotent design** (no duplicate crawling)
- 📊 **Crawl status tracking**
- 🔗 **Outgoing & Incoming link graph**
- 💥 **Crash recovery tested**
- 📈 **Scalable & production-ready architecture**

---

## 🏗️ Architecture Overview

Client
|
| POST /crawl/sitemap
v
API Server (Express)
|
| Enqueue Jobs
v
Redis (Upstash) + BullMQ Queue
|
| Consume Jobs
v
Worker Process
|
| Crawl HTML + Extract Links
v
MongoDB


- API never performs crawling
- Workers handle all heavy tasks
- Redis ensures job durability

---

## 📁 Project Structure

src/
├── api/
│ ├── controllers/
│ │ ├── crawl.controller.js
│ │ └── page.controller.js
│ ├── routes/
│ │ ├── crawl.routes.js
│ │ └── page.routes.js
│ └── server.js
│
├── worker/
│ ├── crawl.worker.js
│ └── buildIncomingLinks.js
│
├── queue/
│ └── crawl.queue.js
│
├── models/
│ └── Page.model.js
│
├── config/
│ ├── mongo.js
│ └── redis.js
│
└── .env


---

## 🔧 Environment Setup

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb+srv://...
REDIS_URL=rediss://...
▶️ How to Run
1️⃣ Install dependencies
npm install
2️⃣ Start API server
npm run dev
3️⃣ Start worker (separate terminal)
node src/worker/crawl.worker.js
🔌 API Endpoints
🔹 Trigger Crawl
POST /crawl/sitemap
Fetches sitemap

Enqueues crawl jobs

Responds immediately (non-blocking)

🔹 Crawl Status
GET /crawl/status
Response:

{
  "total": 100,
  "success": 98,
  "failed": 2,
  "pending": 0
}
🔹 Outgoing Links
POST /pages/outgoing
Body: { "url": "https://example.com" }
🔹 Incoming Links
POST /pages/incoming
Body: { "url": "https://example.com" }
🔹 Top Linked Pages
GET /pages/top-linked?n=5
🔄 Crawl Lifecycle Explained
pending → success
pending → failed (after retries)
pending = queued / processing

success = crawled successfully

failed = unreachable after retries

🧠 Idempotency & Re-Crawl Logic
Each job uses deterministic jobId = hash(url)

MongoDB enforces unique URLs

Already successful pages are skipped

Failed pages are retried on next run

if (page && page.crawlStatus === "success") {
  continue;
}
🧪 FULL TEST CHECKLIST (ALL EXECUTED ✅)
✅ Phase 0 — Clean State
MongoDB cleared

Redis flushed

✅ Phase 1 — Health Check
API server runs

Worker connects to Redis & Mongo

✅ Phase 2 — Non-Blocking API
/crawl/sitemap responds instantly

Crawling runs in background

✅ Phase 3 — Status Tracking
pending, success, failed update correctly

Counts match real state

✅ Phase 4 — Deduplication
Re-trigger does not duplicate data

Successful pages are skipped

Failed pages are retried

✅ Phase 5 — Crash & Retry Test
Worker killed mid-crawl

Jobs persisted in Redis

Worker restart resumes jobs

Retries executed with backoff

✅ Link Graph Validation
Outgoing links stored during crawl

Incoming links built post-crawl

Home page shows high incoming count (expected)

🧠 Design Decisions
Queue over direct crawl → scalability

Worker isolation → fault tolerance

Post-crawl aggregation → faster crawling

Selective reprocessing → efficient retries

🎤 Interview-Ready Summary
“The crawler is fully asynchronous and queue-driven. APIs enqueue jobs, workers process them with retries and backoff, and link graphs are computed as a post-crawl aggregation. The system is idempotent, fault-tolerant, and production-ready.”
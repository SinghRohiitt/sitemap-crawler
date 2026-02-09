import express from "express";
import {
  getIncomingLinks,
  getOutgoingLinks,
  getTopLinkedPages,
} from "../controllers/page.controller.js";

const router = express.Router();

router.post("/incoming", getIncomingLinks);
router.post("/outgoing", getOutgoingLinks);
router.post("/top-linked", getTopLinkedPages);

export default router;

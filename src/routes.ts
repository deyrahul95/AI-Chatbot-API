import express from "express";
import { chatController } from "./controllers/chat.controller";
import { conversationsController } from "./controllers/conversations.controller";
import { responsesController } from "./controllers/responses.controller";

const router = express.Router();

//#region Chat
router.post("/api/chat", chatController.sendMessage);
//#endregion

//#region Conversations
router.get("/api/conversations", conversationsController.getAll);
router.get("/api/conversations/ids", conversationsController.getAllIDs);
router.get("/api/conversations/:id", conversationsController.getDetails);
//#endregion

//#region Responses
router.get("/api/responses/:id", responsesController.getDetails);
//#endregion

export default router;

import type { Request, Response } from "express";
import { conversationRepository } from "../repositories/conversations.repository";

export const conversationsController = {
  getAllIDs(_: Request, res: Response) {
    res.status(200).json({
      status: "Success",
      data: {
        conversationIds: conversationRepository.getAllIDs(),
      },
    });
  },
  getDetails(req: Request, res: Response) {
    const conversationId = req.params.id as string;
    const messages = conversationRepository.getMessages(conversationId);

    if (!messages || messages?.length === 0) {
      res.status(404).json({
        status: "Error",
        message: `Conversation with id: ${conversationId} not found in database.`,
      });
      return;
    }

    res.status(200).json({
      status: "Success",
      data: messages,
    });
  },
};

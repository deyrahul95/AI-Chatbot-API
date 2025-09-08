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
  getAll(_: Request, res: Response) {
    const conversations = conversationRepository.getAll();

    res.status(200).json({
      status: "Success",
      data: conversations,
    });
  },
  getDetails(req: Request, res: Response) {
    const conversationId = req.params.id as string;
    const conversation = conversationRepository.getById(conversationId);

    if (!conversation) {
      res.status(404).json({
        status: "Error",
        message: `Conversation with id: ${conversationId} not found in database.`,
      });
      return;
    }

    res.status(200).json({
      status: "Success",
      data: conversation,
    });
  },
};

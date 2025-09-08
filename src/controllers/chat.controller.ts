import type { Request, Response } from "express";
import z from "zod";
import { chatService } from "../services/chat.service";

const chatSchema = z
  .object({
    prompt: z
      .string()
      .trim()
      .min(1, "Prompt is required!")
      .max(1000, "Prompt is too long (Max. 1000 characters)"),
    conversationId: z.uuid().nullable(),
  })
  .required();

export const chatController = {
  async sendMessage(req: Request, res: Response) {
    try {
      const parseResult = chatSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          status: "Error",
          ...z.treeifyError(parseResult.error),
        });
        return;
      }

      let { prompt, conversationId } = req.body;

      const response = await chatService.sendMessage(prompt, conversationId);

      res.status(200).json({
        status: "Success",
        data: response,
      });
    } catch (err: any) {
      console.error(`🛑 Error Occurred: ${err.message}. ${err}`);
      res.status(500).json({
        status: "Error",
        message: `Failed to get AI Response. Error: ${err.message}`,
      });
    }
  },
};

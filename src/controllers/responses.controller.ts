import type { Request, Response } from "express";
import { responseRepository } from "../repositories/responses.repository";

export const responsesController = {
  getDetails(req: Request, res: Response) {
    const responseId = req.params.id as string;
    const response = responseRepository.getResponse(responseId);

    if (!response) {
      res.status(404).json({
        status: "Error",
        message: `AI Response with id: ${responseId} not found in database.`,
      });
      return;
    }

    res.status(200).json({
      status: "Success",
      data: response,
    });
  },
};

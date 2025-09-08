import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { randomUUIDv7 } from "bun";
import type { ChatCompletionMessageParam } from "openai/resources";
import {
  loadConversationsFromFile,
  saveConversationsToFile,
} from "./utils/conversations";
import { saveResponseToFile } from "./utils/aiResponses";
import z from "zod";

dotenv.config();

const APP = express();
const PORT = process.env.PORT || 3000;

APP.use(express.json());

const openaiClient = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const CONVERSATIONS = await loadConversationsFromFile();

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

APP.get("/api/chat", async (req: Request, res: Response) => {
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

    if (!conversationId) {
      conversationId = randomUUIDv7();
      CONVERSATIONS.set(conversationId, []);
    }

    const messages = CONVERSATIONS.get(conversationId) ?? [];

    if (messages.length === 0) {
      messages.push({
        role: "system",
        content:
          "You are a helpful AI Chatbot Assistance. Give user query's answer in precise and to the point. You have all previous conversation along with user query. First go through this, to get the context. Then, reply the user query promptly. Remember the answer should complete in 100 tokens.",
      });
    }

    messages.push({
      role: "user",
      content: prompt,
    });

    const completion = await openaiClient.chat.completions.create({
      model: "gemma3:1b",
      messages: messages as ChatCompletionMessageParam[],
      temperature: 0.2,
      max_completion_tokens: 100,
    });

    console.log(`🎉 OpenAI Response: ${JSON.stringify(completion)}}`);
    await saveResponseToFile(completion);

    const { role, content } = completion.choices[0]?.message!;

    messages.push({
      role: role,
      content: content ?? "",
    });

    CONVERSATIONS.set(conversationId, messages);
    saveConversationsToFile(CONVERSATIONS);

    res.status(200).json({
      status: "Success",
      prompt: prompt,
      conversationId: conversationId,
      model: completion.model,
      message: content,
      usage: completion.usage,
    });
  } catch (err: any) {
    console.error(`🛑 Error Occurred: ${err.message}. ${err}`);
    res.status(500).json({
      status: "Error",
      message: `Failed to get AI Response. Error: ${err.message}`,
    });
  }
});

APP.listen(PORT, () => {
  console.log(`🚀 Server is running on Port: ${PORT}`);
});

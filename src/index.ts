import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const APP = express();
const PORT = process.env.PORT || 3000;

APP.use(express.json());

const openaiClient = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

APP.get("/api/chat", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    const completion = await openaiClient.chat.completions.create({
      model: "gemma3:1b",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistance. Give user query's answer in precise and to the point. Remember the answer should complete in 100 tokens.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_completion_tokens: 100,
    });

    console.log(`🎉 OpenAI Response: ${JSON.stringify(completion)}`);

    res.status(200).json({
      status: "Success",
      prompt: prompt,
      model: completion.model,
      message: completion.choices[0]?.message.content,
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

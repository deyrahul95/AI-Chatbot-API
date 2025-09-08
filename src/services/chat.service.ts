import { randomUUIDv7 } from "bun";
import OpenAI from "openai";
import { conversationRepository } from "../repositories/conversations.repository";
import type { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";
import { responseRepository } from "../repositories/responses.repository";
import type { IMessage } from "../types/IMessage";

type IUsage = {
  completionTokens: number | undefined;
  promptTokens: number | undefined;
  totalTokens: number | undefined;
};

type IAIResult = {
  id: string;
  conversationId: string;
  model: string;
  content: string;
  usage: IUsage | undefined;
};

const OPENAI_CLIENT = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT: IMessage = {
  role: "system",
  content: `You are a helpful AI Chatbot Assistance. 
    Give user query's answer in precise and to the point. 
    You have all previous conversation along with user query. 
    First go through this, to get the context. 
    Then, reply the user query promptly. 
    Remember the answer should complete in 100 tokens.`,
};

function toAIResponse(
  completion: ChatCompletion,
  conversationId: string
): IAIResult {
  return {
    id: completion.id,
    conversationId: conversationId,
    model: completion.model,
    content: completion.choices[0]?.message.content ?? "N/A",
    usage: {
      completionTokens: completion.usage?.completion_tokens,
      promptTokens: completion.usage?.prompt_tokens,
      totalTokens: completion.usage?.prompt_tokens,
    },
  };
}

export const chatService = {
  async sendMessage(
    prompt: string,
    conversationId: string | null
  ): Promise<IAIResult> {
    if (!conversationId) {
      conversationId = randomUUIDv7();
    }

    const messages = conversationRepository.getMessages(conversationId);

    if (messages.length === 0) {
      messages.push(SYSTEM_PROMPT);
    }

    const userPrompt: IMessage = {
      role: "user",
      content: prompt,
    };
    messages.push(userPrompt);

    const completion = await OPENAI_CLIENT.chat.completions.create({
      model: "gemma3:1b",
      messages: messages as ChatCompletionMessageParam[],
      temperature: 0.2,
      max_completion_tokens: 100,
    });

    console.log(`🎉 OpenAI Response: ${JSON.stringify(completion)}}`);
    const lastMessageID =
      conversationRepository.getLastMessageID(conversationId);
    await responseRepository.saveResponse(
      completion,
      conversationId,
      userPrompt,
      lastMessageID,
      SYSTEM_PROMPT
    );

    const { role, content } = completion.choices[0]?.message!;
    messages.push({
      responseId: completion.id,
      role: role,
      content: content ?? "N/A",
    });

    conversationRepository.setMessages(conversationId, messages);
    return toAIResponse(completion, conversationId);
  },
};

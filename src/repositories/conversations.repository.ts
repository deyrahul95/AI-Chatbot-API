import fs from "fs";
import path from "path";
import type { IMessage } from "../types/IMessage";

type IConversation = {
  id: string;
  messages: IMessage[];
  lastUpdated: string;
};

const FILENAME = "conversations.json";
const DIRNAME = "output";
const CONVERSATIONS: Map<string, IConversation> =
  await loadConversationsFromFile();

function saveConversationsToFile(): void {
  const conversationsObject = Object.fromEntries(CONVERSATIONS);
  const jsonData = JSON.stringify(conversationsObject, null, 2);

  fs.writeFile(path.join(DIRNAME, FILENAME), jsonData, (err) => {
    if (err) {
      console.error("🚫 Error writing to file", err);
    } else {
      console.log(`🎉 Conversations saved to ${DIRNAME}/${FILENAME}`);
    }
  });
}

export function loadConversationsFromFile(): Promise<
  Map<string, IConversation>
> {
  const outputPath = path.join(DIRNAME, FILENAME);

  return new Promise((resolve, reject) => {
    fs.readFile(outputPath, "utf8", (err, data) => {
      if (err) {
        console.error("🚫 Error reading file", err);
        return reject(err);
      }

      try {
        const conversationsObject: Record<string, IConversation> =
          JSON.parse(data);

        const conversations = new Map<string, IConversation>(
          Object.entries(conversationsObject)
        );

        console.log(`✅ Conversations loaded from ${outputPath}`);
        resolve(conversations);
      } catch (parseError) {
        console.error("🚫 Error parsing JSON", parseError);
        reject(parseError);
      }
    });
  });
}

export const conversationRepository = {
  getAll() {
    return Array.from(CONVERSATIONS.values());
  },
  getById(conversationId: string) {
    return CONVERSATIONS.get(conversationId);
  },
  getAllIDs(): string[] {
    return Array.from(CONVERSATIONS.keys());
  },
  getLastMessageID(conversationId: string): string | null {
    const conversation = CONVERSATIONS.get(conversationId);

    if (!conversation || conversation.messages.length === 0) {
      return null;
    }

    const lastMessage = conversation.messages.findLast(
      (m) => m.role === "assistant"
    );

    return lastMessage?.responseId ?? null;
  },
  getMessages(conversationId: string): IMessage[] {
    return CONVERSATIONS.get(conversationId)?.messages ?? [];
  },
  setMessages(conversationId: string, messages: IMessage[]) {
    const conversation: IConversation = {
      id: conversationId,
      messages: messages,
      lastUpdated: new Date().toISOString(),
    };
    CONVERSATIONS.set(conversationId, conversation);
    saveConversationsToFile();
  },
};

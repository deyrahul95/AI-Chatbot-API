import type { IMessage } from "../types/IMessage";
import {
  loadConversationsFromFile,
  saveConversationsToFile,
} from "../utils/conversations";

const conversations = await loadConversationsFromFile();

export const conversationRepository = {
  getAllIDs(): string[] {
    return Array.from(conversations.keys());
  },
  getMessages(conversationId: string): IMessage[] {
    return conversations.get(conversationId) ?? [];
  },
  setMessages(conversationId: string, messages: IMessage[]) {
    conversations.set(conversationId, messages);
    saveConversationsToFile(conversations);
  },
};

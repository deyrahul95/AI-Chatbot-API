export type IMessage = {
  responseId?: string | null;
  role: string;
  content: string;
};
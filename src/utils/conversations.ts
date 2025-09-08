import fs from "fs";
import path from "path";
import type { IMessage } from "../types/IMessage";

const FILENAME = "conversations.json";
const DIRNAME = "output";

export function saveConversationsToFile(
  conversation: Map<string, IMessage[]>
): void {
  const conversationsObject = Object.fromEntries(conversation);
  const jsonData = JSON.stringify(conversationsObject, null, 2);

  fs.writeFile(path.join(DIRNAME, FILENAME), jsonData, (err) => {
    if (err) {
      console.error("🚫 Error writing to file", err);
    } else {
      console.log(`🎉 Conversations saved to ${DIRNAME}/${FILENAME}`);
    }
  });
}

export function loadConversationsFromFile(): Promise<Map<string, IMessage[]>> {
  const outputPath = path.join(DIRNAME, FILENAME);

  return new Promise((resolve, reject) => {
    fs.readFile(outputPath, "utf8", (err, data) => {
      if (err) {
        console.error("🚫 Error reading file", err);
        return reject(err);
      }

      try {
        const conversationsObject: Record<string, IMessage[]> =
          JSON.parse(data);

        const conversations = new Map<string, IMessage[]>(
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
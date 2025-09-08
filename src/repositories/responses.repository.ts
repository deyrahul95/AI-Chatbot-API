import fs from "fs";
import type { ChatCompletion } from "openai/resources";
import type { CompletionUsage } from "openai/resources.js";
import path from "path";
import type { IMessage } from "../types/IMessage";

type IResponse = {
  id: string;
  conversationId: string;
  previousResponseId?: string | null;
  systemPrompt?: IMessage;
  userPrompt: IMessage;
  object: string;
  created: number;
  model: string;
  system_fingerprint?: string;
  choices: ChatCompletion.Choice[];
  usage?: CompletionUsage;
};

const FILENAME = "ai-responses.json";
const DIRNAME = "output";
const RESPONSES: Map<string, IResponse> = await loadResponsesFromFile();

async function saveResponseToFile() {
  const responsesObject = Object.fromEntries(RESPONSES);
  const jsonData = JSON.stringify(responsesObject, null, 2);

  fs.writeFile(path.join(DIRNAME, FILENAME), jsonData, (err) => {
    if (err) {
      console.error("🚫 Error writing to file", err);
    } else {
      console.log(`🎉 Response saved to ${DIRNAME}/${FILENAME}`);
    }
  });
}

function loadResponsesFromFile(): Promise<Map<string, IResponse>> {
  const outputPath = path.join(DIRNAME, FILENAME);

  return new Promise((resolve, reject) => {
    fs.readFile(outputPath, "utf8", (err, data) => {
      if (err) {
        console.error("🚫 Error reading file", err);
        return reject(err);
      }

      try {
        const responsesObject: Record<string, IResponse> = JSON.parse(data);

        const responses = new Map<string, IResponse>(
          Object.entries(responsesObject)
        );

        console.log(`✅ Responses loaded from ${outputPath}`);
        resolve(responses);
      } catch (parseError) {
        console.error("🚫 Error parsing JSON", parseError);
        reject(parseError);
      }
    });
  });
}

export const responseRepository = {
  async saveResponse(
    completion: ChatCompletion,
    conversationId: string,
    userPrompt: IMessage,
    previousResponseId: string | null,
    systemPrompt: IMessage | undefined
  ) {
    const response: IResponse = {
      ...completion,
      conversationId,
      previousResponseId,
      systemPrompt,
      userPrompt,
    };

    RESPONSES.set(response.id, response);
    await saveResponseToFile();
  },
};

import fs from "fs";
import type { ChatCompletion } from "openai/resources";
import path from "path";

const FILENAME = "ai-responses.json";
const DIRNAME = "output";

export async function saveResponseToFile(response: ChatCompletion) {
  const responseMap = await loadResponsesFromFile();
  responseMap.set(response.id, response);

  const responsesObject = Object.fromEntries(responseMap);
  const jsonData = JSON.stringify(responsesObject, null, 2);

  fs.writeFile(path.join(DIRNAME, FILENAME), jsonData, (err) => {
    if (err) {
      console.error("🚫 Error writing to file", err);
    } else {
      console.log(`🎉 Response saved to ${DIRNAME}/${FILENAME}`);
    }
  });
}

function loadResponsesFromFile(): Promise<Map<string, ChatCompletion>> {
  const outputPath = path.join(DIRNAME, FILENAME);

  return new Promise((resolve, reject) => {
    fs.readFile(outputPath, "utf8", (err, data) => {
      if (err) {
        console.error("🚫 Error reading file", err);
        return reject(err);
      }

      try {
        const responsesObject: Record<string, ChatCompletion> =
          JSON.parse(data);

        const conversations = new Map<string, ChatCompletion>(
          Object.entries(responsesObject)
        );

        console.log(`✅ Responses loaded from ${outputPath}`);
        resolve(conversations);
      } catch (parseError) {
        console.error("🚫 Error parsing JSON", parseError);
        reject(parseError);
      }
    });
  });
}

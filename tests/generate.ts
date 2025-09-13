import OpenAI from "openai";
import path from "path";
import fs from "fs";

const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "PROMO_CODE_APPLIED",
});

class User {
  public id: string = "";
  public firstName: string = "";
  public lastName: string = "";
  public email: string = "";
  public age: number = 0;
  public subjects: string[] = [];
  public roleNumber: number = 0;
  public marks: number[] = [];
  public gender: string = "";
}

async function generateData(
  schema: any,
  count: number = 5
): Promise<string | null | undefined> {
  const systemPrompt = `
    You are a mock data generator. Generate ${count} random objects of the class "${schema}".
    The output must be a valid JSON array of objects, each matching the class description.
    Make sure the data of array is unique data. If the class contains some array of field then please make sure to put unique
    data for this field.`;

  const userPrompt = `Class: ${schema} Count: ${count} Return only JSON.`;

  console.log(`🧑‍💻 Generating response for user query: ${userPrompt}`);
  const response = await openai.chat.completions.create({
    model: "qwen3:0.6b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      json_schema: schema,
      type: "json_schema",
    },
    temperature: 0.5,
    max_completion_tokens: 100,
  });

  console.log(`🚀 AI Response => ${JSON.stringify(response)}`);
  return response.choices[0]?.message.content;
}

function removeThinkBlock(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>\n*/g, "");
}

// Example use
async function main() {
  const data = await generateData(User, 10);

  if (data) {
    console.log(`⚙️ Removing think block ...`);
    const cleanedData = removeThinkBlock(data);

    console.log(`\n🎉 Output => ${cleanedData} \n`);
    const jsonData = JSON.parse(cleanedData);

    const outputPath = path.join(__dirname, "generated_data.json");
    console.log(`📁 Saving generated data into ${outputPath}`);

    fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error("🚫 Error writing file:", err);
      } else {
        console.log(`✅ JSON data written to ${outputPath}`);
      }
    });
  } else {
    console.log("🛑 No response received from AI!");
  }
}

await main();

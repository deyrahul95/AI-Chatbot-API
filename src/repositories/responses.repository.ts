import type { ChatCompletion } from "openai/resources";
import { saveResponseToFile } from "../utils/aiResponses";

export const responseRepository = {
    async saveResponse(response: ChatCompletion){
        await saveResponseToFile(response);
    }
}
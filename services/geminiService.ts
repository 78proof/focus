
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Just transcribes audio to text using Gemini's multimodal capabilities.
   */
  static async transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Audio
          }
        },
        {
          text: "Transcribe this audio exactly as spoken. If there is no speech, return an empty string. Output ONLY the transcription text."
        }
      ]
    });
    return response.text?.trim() || "";
  }

  /**
   * Takes the final note content and generates a summary and suggests a folder.
   */
  static async finalizeNote(content: string, existingFolders: {id: string, name: string}[]): Promise<{summary: string, folderId: string}> {
    const ai = this.getClient();
    const folderNames = existingFolders.map(f => f.name).join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Note content: "${content}"\n\n1. Summarize into professional Granola-style bullet points.\n2. Pick the best folder from: [${folderNames}]. If none fit, pick "General".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestedFolder: { type: Type.STRING }
          },
          required: ["summary", "suggestedFolder"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const folder = existingFolders.find(f => f.name.toLowerCase() === result.suggestedFolder?.toLowerCase()) || existingFolders[0];

    return {
      summary: result.summary || "No summary generated.",
      folderId: folder.id
    };
  }

  static async assistantChat(query: string, context: string): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context (Outlook & Recent Notes):\n${context}\n\nUser Question: ${query}`,
      config: {
        systemInstruction: "You are OmniWork AI. Use context to help the user with work, meetings, and emails. Be concise and professional."
      }
    });
    return response.text || "I'm sorry, I couldn't process that.";
  }
}

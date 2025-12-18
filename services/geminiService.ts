
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  static async summarizeNote(content: string): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following meeting/work note into a professional "Granola" style summary. Focus on key actions and insights: \n\n${content}`,
      config: {
        systemInstruction: "You are a professional executive assistant. You create concise, bulleted summaries that highlight actionable items and critical takeaways."
      }
    });
    return response.text || "Summary unavailable.";
  }

  static async assistantChat(query: string, context: string): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context (Outlook & Recent Notes):\n${context}\n\nUser Question: ${query}`,
      config: {
        systemInstruction: "You are OmniWork AI, an integrated assistant. Use the provided Outlook and Note context to answer the user's questions about their day, work, or emails. Be helpful, professional, and concise."
      }
    });
    return response.text || "I'm sorry, I couldn't process that request.";
  }
}

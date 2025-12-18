
import { GoogleGenAI, Type, Modality } from "@google/genai";

export class GeminiService {
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  static async transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { inlineData: { mimeType, data: base64Audio } },
        { text: "Transcribe this audio exactly. Output ONLY text." }
      ]
    });
    return response.text?.trim() || "";
  }

  static async assistantChat(query: string, context: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context:\n${context}\n\nUser: ${query}`,
      config: {
        systemInstruction: `You are OmniWork AI. 
        1. If the user wants to add a task/to-do, return a JSON field "newTodo" with the task string.
        2. Always respond concisely and professionally.
        3. Keep track of the user's schedule and emails mentioned in context.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            newTodo: { type: Type.STRING, description: "Only present if user asked to create a task" }
          },
          required: ["reply"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  }

  static async speakText(text: string): Promise<Uint8Array | null> {
    const ai = this.getClient();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Speak this clearly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return this.decodeBase64(base64Audio);
      }
    } catch (e) {
      console.error("TTS failed", e);
    }
    return null;
  }

  private static decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  static async finalizeNote(content: string, folders: any[]) {
     const ai = this.getClient();
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Finalize this note: ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestedFolder: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }
}

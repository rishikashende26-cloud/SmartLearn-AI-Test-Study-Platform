import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.GEMINI_API_KEY if available (platform provided)
// Fallback to a placeholder or a way to detect missing key
const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY not found in environment. AI features may not work.");
  }
  return key || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const generateTest = async (content: string, level: string) => {
  console.log("Generating test for content length:", content.length, "Level:", level);
  try {
    const prompt = `Generate a 30-question multiple choice test based on the following content. 
    Difficulty Level: ${level}.
    Return the response in JSON format with an array of questions, each having 'question', 'options' (array of 4), and 'correctAnswer' (index 0-3).
    Content: ${content}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER }
                },
                required: ["question", "options", "correctAnswer"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error in generateTest:", error);
    throw error;
  }
};

export const generateSummary = async (content: string) => {
  console.log("Generating summary for content length:", content.length);
  try {
    const prompt = `Summarize the following content into key points and important points to revise. 
    Return the response in JSON format with 'keyPoints' (array) and 'revisionPoints' (array).
    Content: ${content}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            revisionPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["keyPoints", "revisionPoints"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error in generateSummary:", error);
    throw error;
  }
};

export const analyzeProctoringFrame = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] // Remove the data:image/jpeg;base64, prefix
          }
        },
        {
          text: "Analyze this webcam frame for exam proctoring. Check if the person is looking away from the screen, if there are multiple people, or if they are using a phone. Return JSON with 'isViolating' (boolean) and 'reason' (string, empty if no violation)."
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isViolating: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ["isViolating", "reason"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error in analyzeProctoringFrame:", error);
    return { isViolating: false, reason: "" }; // Fail safe
  }
};

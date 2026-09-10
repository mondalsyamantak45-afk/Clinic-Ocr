import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    corrected_text: {
      type: Type.STRING,
      description: "The OCR text corrected for spelling and formatting mistakes.",
    },
    summary: {
      type: Type.STRING,
      description: "A concise summary of the prescription and doctor notes.",
    },
    medicines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          dosage: { type: Type.STRING },
          frequency: { type: Type.STRING },
        },
        required: ["name", "dosage", "frequency"],
      },
    },
    important_findings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Categorical tags like Fever, Antibiotic, Pediatric, etc.",
    },
    confidence_score: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 representing how confident you are in the extraction and transcription accuracy based on the provided OCR text.",
    }
  },
  required: ["corrected_text", "summary", "medicines", "important_findings", "tags", "confidence_score"],
};

export async function processOCRTextWithGemini(rawOcrText: string) {
  try {
    const prompt = `You are a medical AI assistant. Your task is to process raw OCR text extracted from a handwritten prescription.
Rules:
1. Never hallucinate missing information.
2. Preserve uncertain text.
3. Prefix unclear medicine names with "Possibly ".
4. Return only valid JSON according to the schema.

Raw OCR Text:
"""
${rawOcrText}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: JSON_SCHEMA,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini returned empty response.");
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Processing failed:", error?.message || error);
    throw error;
  }
}


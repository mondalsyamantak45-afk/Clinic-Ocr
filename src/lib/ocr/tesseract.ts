import Tesseract from "tesseract.js";

export async function extractTextFromImage(imageBuffer: Buffer): Promise<{ text: string, confidence: number }> {
  try {
    const worker = await Tesseract.createWorker("eng");
    const { data: { text, confidence } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    return { text, confidence };
  } catch (error) {
    console.error("Tesseract OCR failed:", error);
    throw new Error("Failed to extract text from image.");
  }
}


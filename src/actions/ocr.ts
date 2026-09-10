"use server";

import { preprocessImage } from "@/lib/ocr/preprocess";
import { extractTextFromImage } from "@/lib/ocr/tesseract";
import { processOCRTextWithGemini } from "@/lib/ocr/gemini";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function processPrescriptionImage(formData: FormData) {
  const file = formData.get("image") as File;
  if (!file) throw new Error("No image provided.");

  // Save the file locally (MVP)
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);
  const imageUrl = `/uploads/${filename}`;

  // Process image pipeline
  const preprocessedBuffer = await preprocessImage(buffer);
  const { text: rawOcrText, confidence: ocrConfidence } = await extractTextFromImage(preprocessedBuffer);
  
  let aiResult = null;
  let aiError = false;
  if (rawOcrText && rawOcrText.trim().length > 5) {
    try {
      aiResult = await processOCRTextWithGemini(rawOcrText);
    } catch (e) {
      console.warn("AI processing failed, returning raw OCR only.", e);
      aiError = true;
    }
  }

  return {
    imageUrl,
    rawOcrText,
    ocrConfidence,
    aiResult,
    aiError,
  };
}


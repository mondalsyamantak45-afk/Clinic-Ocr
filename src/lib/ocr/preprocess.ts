import sharp from "sharp";

export async function preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const processedImage = await sharp(imageBuffer)
      .resize({ width: 2000, withoutEnlargement: true }) // Auto resize max width for better OCR
      .grayscale() // Convert to grayscale
      .normalize() // Enhance contrast
      .sharpen() // Text sharpening
      .jpeg({ quality: 100 })
      .toBuffer();

    return processedImage;
  } catch (error) {
    console.error("Image preprocessing failed:", error);
    return imageBuffer; // Fallback to original image if preprocessing fails
  }
}


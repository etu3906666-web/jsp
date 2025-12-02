import Tesseract from "tesseract.js";

export async function extractTextFromImage(imageUrl) {
    try {
        const result = await Tesseract.recognize(imageUrl, 'kor+eng', {
            logger: (m) => console.log(m),
        });

        return result.data.text
    } catch (err) {
        console.error("OCR 실패:", err);
        return "";
    }
}
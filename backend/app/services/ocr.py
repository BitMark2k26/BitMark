import asyncio
import io
import mimetypes
from dataclasses import dataclass
import fitz  # PyMuPDF
from PIL import Image
from pdf2image import convert_from_bytes
import pytesseract
from pytesseract import Output
from google import genai
from google.genai import types
from app.core.config import settings
from app.services.imagePreprocess import preprocess_for_ocr

gemini_client = (
    genai.Client(api_key=settings.GEMINI_API_KEY)
    if settings.GEMINI_API_KEY
    else None
)

VISION_OCR_PROMPT = (
    "Transcribe this exam page verbatim. "
    "Use standard Unicode logic/math symbols (∀, ∃, ¬, ∧, ∨, →, ↔). "
    "Preserve question labels like (a), (b), (e), (f), (g) and step numbers exactly as written. "
    "CRITICAL: Do NOT solve the questions or fix any mistakes—transcribe exactly what is written. "
    "If a word or symbol is genuinely illegible, mark it as [illegible]."
)


@dataclass
class OCRResult:
    text: str
    ocr_confidence: float


def _resize_for_vision(image: Image.Image, max_width: int = 1600) -> Image.Image:
    rgb = image.convert("RGB")
    if rgb.width > max_width:
        ratio = max_width / float(rgb.width)
        rgb = rgb.resize(
            (max_width, int(rgb.height * ratio)), Image.Resampling.LANCZOS
        )
    return rgb


def _ocr_with_gemini(raw_image: Image.Image) -> tuple[str, float]:
    if not gemini_client:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    img = _resize_for_vision(raw_image)
    response = gemini_client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=[VISION_OCR_PROMPT, img],
        config=types.GenerateContentConfig(temperature=0.0),
    )
    text = (response.text or "").strip()
    illegible_count = text.lower().count("[illegible]")
    conf = max(0.5, round(0.92 - (0.05 * illegible_count), 4)) if text else 0.0
    print(f"GEMINI OCR extracted {len(text)} chars (conf={conf})")
    return text, conf


def _ocr_page_with_confidence(processed_image: Image.Image) -> tuple[str, list[float]]:
    text = pytesseract.image_to_string(processed_image)
    data = pytesseract.image_to_data(processed_image, output_type=Output.DICT)
    confidences = [
        float(conf) / 100.0
        for conf, word in zip(data["conf"], data["text"])
        if str(conf) != "-1" and float(conf) >= 0 and word.strip()
    ]
    return text, confidences


def _ocr_with_fallback(raw_image: Image.Image, enhance_scan: bool) -> tuple[str, list[float]]:
    if gemini_client:
        try:
            text, conf = _ocr_with_gemini(raw_image)
            if text:
                return text, [conf]
        except Exception as exc:
            print(f"Gemini OCR failed, falling back to Tesseract: {exc}")

    processed_image = preprocess_for_ocr(raw_image, enhance_scan=enhance_scan)
    text, confs = _ocr_page_with_confidence(processed_image)

    if not text.strip():
        rgb_image = raw_image.convert("RGB")
        text, confs = _ocr_page_with_confidence(rgb_image)

    avg_conf = (sum(confs) / len(confs)) if confs else 0.0
    print(f"Tesseract OCR extracted {len(text.strip())} chars (conf={avg_conf:.2f})")
    return text, confs


def _extract_native_pdf_text(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    native_pages: list[str] = []
    try:
        for idx, page in enumerate(doc):
            page_text = page.get_text("text").strip()
            if page_text:
                native_pages.append(f"--- Page {idx + 1} ---\n{page_text}")
    finally:
        doc.close()
    return "\n\n".join(native_pages).strip()


def _extract_sync(
    file_bytes: bytes,
    filename: str,
    content_type: str | None = None,
    enhance_scan: bool = True,
) -> OCRResult:
    extracted_pages: list[str] = []
    all_confidences: list[float] = []

    is_pdf = content_type == "application/pdf" or filename.lower().endswith(".pdf")
    if is_pdf:
        # 1. Extract native selectable text first (for digital question papers)
        combined_native = _extract_native_pdf_text(file_bytes)
        if len(combined_native) >= 30:
            print(f"NATIVE PDF TEXT extracted {len(combined_native)} chars")
            return OCRResult(text=combined_native, ocr_confidence=1.0)

        # 2. Scanned PDF -> render pages and run Gemini Vision / Tesseract OCR
        pages = convert_from_bytes(file_bytes, dpi=200)
        for idx, page_image in enumerate(pages):
            text, page_confs = _ocr_with_fallback(page_image, enhance_scan=enhance_scan)
            if text.strip():
                extracted_pages.append(f"--- Page {idx + 1} ---\n{text.strip()}")
                all_confidences.extend(page_confs)
    else:
        image = Image.open(io.BytesIO(file_bytes))
        text, page_confs = _ocr_with_fallback(image, enhance_scan=enhance_scan)
        if text.strip():
            extracted_pages.append(text.strip())
            all_confidences.extend(page_confs)

    avg_confidence = (
        round(sum(all_confidences) / len(all_confidences), 4)
        if all_confidences
        else 0.0
    )
    return OCRResult(
        text="\n\n".join(extracted_pages).strip(),
        ocr_confidence=avg_confidence,
    )


async def extract_text_from_bytes(
    file_bytes: bytes,
    filename: str,
    content_type: str | None = None,
    enhance_scan: bool = True,
) -> OCRResult:
    return await asyncio.to_thread(
        _extract_sync, file_bytes, filename, content_type, enhance_scan
    )


async def extract_text_from_file(
    file_bytes: bytes,
    filename: str,
    content_type: str | None = None,
    enhance_scan: bool = True,
) -> OCRResult:
    guessed_type = content_type or mimetypes.guess_type(filename)[0]
    return await extract_text_from_bytes(
        file_bytes, filename, guessed_type, enhance_scan
    )
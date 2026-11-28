import asyncio
import base64
import io
import mimetypes
import time
from dataclasses import dataclass
import pymupdf as fitz
from PIL import Image
from pdf2image import convert_from_bytes
import pytesseract
from pytesseract import Output
from google import genai
from google.genai import types
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq
from app.core.config import settings
from app.services.imagePreprocess import preprocess_for_ocr

gemini_client = (
    genai.Client(
        api_key=settings.GEMINI_API_KEY,
        http_options=types.HttpOptions(
            timeout=60_000,  # 35 seconds per request (in ms)
            retry_options=types.HttpRetryOptions(attempts=1),  # fail fast to next model
        ),
    )
    if settings.GEMINI_API_KEY
    else None
)

GEMINI_VISION_MODELS = [
    "gemini-4-hydrogen",
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite",
]

groq_vision_llm = (
    ChatGroq(
        model="qwen/qwen3.8-27b",
        temperature=0,
        max_tokens=2048,
        api_key=settings.GROQ_API_KEY,
    )
    if settings.GROQ_API_KEY
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


def _score_vision_text(text: str, base_conf: float = 0.92) -> float:
    if not text:
        return 0.0
    illegible_count = text.lower().count("[illegible]")
    return max(0.5, round(base_conf - (0.05 * illegible_count), 4))


def _ocr_with_gemini(raw_image: Image.Image) -> tuple[str, float]:
    if not gemini_client:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    img = _resize_for_vision(raw_image)
    last_exc: Exception | None = None

    for model_name in GEMINI_VISION_MODELS:
        for attempt in range(1, 3):
            try:
                response = gemini_client.models.generate_content(
                    model=model_name,
                    contents=[VISION_OCR_PROMPT, img],
                    config=types.GenerateContentConfig(temperature=0.0),
                )
                text = (response.text or "").strip()
                if text:
                    conf = _score_vision_text(text, base_conf=0.92)
                    print(
                        f"GEMINI OCR [{model_name}] extracted {len(text)} chars (conf={conf})"
                    )
                    print("gemini", text)
                    return text, conf
            except Exception as exc:
                last_exc = exc
                err_str = str(exc)
                print(f"GEMINI OCR [{model_name}] attempt {attempt} failed: {exc}")
                if any(
                    code in err_str
                    for code in ("503", "UNAVAILABLE", "504", "DEADLINE_EXCEEDED", "404")
                ):
                    break
                if attempt < 2:
                    time.sleep(1.5)

    raise RuntimeError(f"All Gemini vision models failed: {last_exc}")


def _ocr_with_groq_backup(raw_image: Image.Image) -> tuple[str, float]:
    if not groq_vision_llm:
        raise RuntimeError("GROQ_API_KEY is not configured.")

    img = _resize_for_vision(raw_image)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    b64_img = base64.b64encode(buf.getvalue()).decode("utf-8")

    msg = HumanMessage(
        content=[
            {"type": "text", "text": VISION_OCR_PROMPT},
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"},
            },
        ]
    )
    response = groq_vision_llm.invoke([msg])
    text = str(response.content).strip()
    conf = _score_vision_text(text, base_conf=0.90)
    print(f"GROQ VISION BACKUP extracted {len(text)} chars (conf={conf})")
    print("groq", text)
    return text, conf


def _ocr_page_with_confidence(processed_image: Image.Image) -> tuple[str, list[float]]:
    text = pytesseract.image_to_string(processed_image)
    data = pytesseract.image_to_data(processed_image, output_type=Output.DICT)
    confidences = [
        float(conf) / 100.0
        for conf, word in zip(data["conf"], data["text"])
        if str(conf) != "-1" and float(conf) >= 0 and word.strip()
    ]
    print("tesseract", text)
    return text, confidences


def _ocr_with_fallback(
    raw_image: Image.Image, enhance_scan: bool
) -> tuple[str, list[float]]:
    if gemini_client:
        try:
            text, conf = _ocr_with_gemini(raw_image)
            if text:
                return text, [conf]
        except Exception as exc:
            print(f"Gemini OCR failed, falling back to Groq Vision: {exc}")

    if groq_vision_llm:
        try:
            text, conf = _ocr_with_groq_backup(raw_image)
            if text:
                return text, [conf]
        except Exception as exc:
            print(f"Groq Vision failed, falling back to Tesseract: {exc}")

    processed_image = preprocess_for_ocr(raw_image, enhance_scan=enhance_scan)
    text, confs = _ocr_page_with_confidence(processed_image)

    if not text.strip():
        rgb_image = raw_image.convert("RGB")
        text, confs = _ocr_page_with_confidence(rgb_image)

    avg_conf = (sum(confs) / len(confs)) if confs else 0.0
    print(text)
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
    print("\n\n".join(native_pages).strip())
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
            return OCRResult(text=combined_native, ocr_confidence=1.0)

        # 2. Scanned PDF -> render pages and run Gemini Vision / Groq / Tesseract OCR
        pages = convert_from_bytes(file_bytes, dpi=200)
        for idx, page_image in enumerate(pages):
            text, page_confs = _ocr_with_fallback(
                page_image, enhance_scan=enhance_scan
            )
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
import cv2
import numpy as np
from PIL import Image


def to_grayscale(pil_image: Image.Image) -> np.ndarray:
    rgb_array = np.array(pil_image.convert("RGB"))
    return cv2.cvtColor(rgb_array, cv2.COLOR_RGB2GRAY)


def deskew_image(gray_image: np.ndarray) -> np.ndarray:
    _, inverted = cv2.threshold(
        gray_image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )
    coords = cv2.findNonZero(inverted)
    if coords is None:
        return gray_image

    angle = cv2.minAreaRect(coords)[-1]
    if angle > 45:
        angle = angle - 90
    elif angle < -45:
        angle = 90 + angle

    if abs(angle) < 0.5:
        return gray_image

    height, width = gray_image.shape[:2]
    center = (width // 2, height // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)

    return cv2.warpAffine(
        gray_image,
        rotation_matrix,
        (width, height),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )


def apply_adaptive_threshold(gray_image: np.ndarray) -> np.ndarray:
    denoised = cv2.medianBlur(gray_image, 3)
    return cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        15,
    )


def preprocess_for_ocr(pil_image: Image.Image, enhance_scan: bool = True) -> Image.Image:
    gray = to_grayscale(pil_image)

    if not enhance_scan:
        return Image.fromarray(gray)

    straightened = deskew_image(gray)
    cleaned = apply_adaptive_threshold(straightened)
    return Image.fromarray(cleaned)
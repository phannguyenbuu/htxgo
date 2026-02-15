from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
import re
import unicodedata

from bs4 import BeautifulSoup
from PIL import Image, ImageOps, ImageFilter
import pytesseract
import requests


BASE_URL = "https://www.csgt.vn"
CAPTCHA_PATH = "/lib/captcha/captcha.class.php"
POST_PATH = "/?mod=contact&task=tracuu_post&ajax"
RESULTS_URL = "https://www.csgt.vn/tra-cuu-phuong-tien-vi-pham.html"
DEFAULT_TIMEOUT = 40
MAX_RETRIES = 5


@dataclass
class LookupResult:
    license_plate: str
    violations: list[dict]


def _normalize(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9 ]+", " ", text).strip()


def _ocr_captcha(image_bytes: bytes) -> str:
    image = Image.open(BytesIO(image_bytes)).convert("L")
    # Improve OCR quality for simple captcha text.
    image = ImageOps.autocontrast(image)
    image = image.filter(ImageFilter.SHARPEN)
    config = r"--oem 3 --psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    text = pytesseract.image_to_string(image, config=config)
    return re.sub(r"[^A-Z0-9]", "", text.upper())


def _extract_violations(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    violations: list[dict] = []
    current: dict = {}
    resolution_places: list[dict] = []

    def flush() -> None:
        nonlocal current, resolution_places
        if current:
            current["resolutionPlaces"] = resolution_places
            violations.append(current)
            current = {}
            resolution_places = []

    for form_group in soup.select(".form-group"):
        label_node = form_group.select_one("label span")
        value_node = form_group.select_one(".col-md-9")
        label = (label_node.get_text(strip=True) if label_node else "").strip()
        value = (value_node.get_text(" ", strip=True) if value_node else "").strip()

        if form_group.find_previous_sibling("hr") or form_group.find_next_sibling("hr"):
            flush()

        if label and value:
            key = _normalize(label)
            if "bien kiem soat" in key:
                current["licensePlate"] = value
            elif "mau bien" in key:
                current["plateColor"] = value
            elif "loai phuong tien" in key:
                current["vehicleType"] = value
            elif "thoi gian vi pham" in key:
                current["violationTime"] = value
            elif "dia diem vi pham" in key:
                current["violationLocation"] = value
            elif "hanh vi vi pham" in key:
                current["violationBehavior"] = value
            elif "trang thai" in key:
                current["status"] = value
            elif "don vi phat hien vi pham" in key:
                current["detectionUnit"] = value

        line = form_group.get_text(" ", strip=True)
        if re.match(r"^[0-9]+\.", line):
            resolution_places.append({"name": line})
        elif line.lower().startswith("địa chỉ:") or _normalize(line).startswith("dia chi"):
            if resolution_places:
                address = line.split(":", 1)[1].strip() if ":" in line else line
                resolution_places[-1]["address"] = address

    flush()
    return violations


def lookup_fines(license_plate: str) -> LookupResult:
    session = requests.Session()
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    for _ in range(MAX_RETRIES):
        captcha_resp = session.get(
            f"{BASE_URL}{CAPTCHA_PATH}", headers=headers, timeout=DEFAULT_TIMEOUT
        )
        captcha_resp.raise_for_status()
        captcha = _ocr_captcha(captcha_resp.content)
        if not captcha:
            continue

        post_resp = session.post(
            f"{BASE_URL}{POST_PATH}",
            data={
                "BienKS": license_plate,
                "Xe": "1",
                "captcha": captcha,
                "ipClient": "9.9.9.91",
                "cUrl": "1",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded", **headers},
            timeout=DEFAULT_TIMEOUT,
        )
        post_resp.raise_for_status()

        # Site returns plain "404" when captcha validation fails.
        if str(post_resp.text).strip() == "404":
            continue

        results_resp = session.get(
            f"{RESULTS_URL}?&LoaiXe=1&BienKiemSoat={license_plate}",
            headers=headers,
            timeout=DEFAULT_TIMEOUT,
        )
        results_resp.raise_for_status()
        violations = _extract_violations(results_resp.text)
        return LookupResult(license_plate=license_plate, violations=violations)

    raise RuntimeError("Không xác minh được captcha sau nhiều lần thử")


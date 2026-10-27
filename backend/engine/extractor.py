import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel
from PIL import Image
import pypdf

from backend.models.schemas import ExtractedField, ExtractedDocumentInfo

# Common regex patterns for key application fields
PATTERNS = {
    "applicant_name": [
        r"(?:Applicant\s*Name|Full\s*Name|Candidate\s*Name|Name\s*of\s*Applicant|Name)\s*[:\-]\s*([A-Za-z\s\.\'\-]+?)(?=\n|\r|,|\s{2,}|$)",
        r"(?:Student\s*Name|Individual\s*Name)\s*[:\-]\s*([A-Za-z\s\.\'\-]+?)(?=\n|\r|,|\s{2,}|$)"
    ],
    "dob": [
        r"(?:Date\s*of\s*Birth|DOB|Birth\s*Date)\s*[:\-]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})",
        r"(?:DOB)\s*[:\-]?\s*([0-9]{2}[A-Za-z]{3}[0-9]{4})"
    ],
    "declared_income": [
        r"(?:Annual\s*Income|Family\s*Income|Gross\s*Income|Monthly\s*Income|Declared\s*Income|Income)\s*[:\-]?\s*(?:INR|Rs\.?|₹|\$)?\s*([\d,]+(?:\.\d{2})?)",
        r"(?:Total\s*Income)\s*[:\-]?\s*(?:INR|Rs\.?|₹|\$)?\s*([\d,]+(?:\.\d{2})?)"
    ],
    "address": [
        r"(?:Permanent\s*Address|Residential\s*Address|Current\s*Address|Address)\s*[:\-]\s*([^\n\r]{10,120})",
        r"(?:Location|Domicile)\s*[:\-]\s*([^\n\r]{5,80})"
    ],
    "issue_date": [
        r"(?:Date\s*of\s*Issue|Issue\s*Date|Issued\s*On|Date)\s*[:\-]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})"
    ],
    "expiry_date": [
        r"(?:Expiry\s*Date|Date\s*of\s*Expiry|Valid\s*Till|Valid\s*Thru|Expires\s*On)\s*[:\-]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})"
    ],
    "document_ref_no": [
        r"(?:Certificate\s*No\.?|Doc(?:ument)?\s*Ref(?:\.|erence)?\s*(?:No\.?)?|Ref(?:\.|erence)?\s*No\.?|Application\s*ID|ID\s*Number)\s*[:\-]\s*([A-Za-z0-9\-\/]{4,30})",
        r"(?:Aadhaar\s*(?:No\.?)?|Passport\s*(?:No\.?)?)\s*[:\-]\s*([A-Za-z0-9\s\-]{8,20})"
    ]
}

def clean_extracted_value(val: str, field_type: str) -> str:
    val = val.strip().strip(":").strip("-").strip()
    val = re.sub(r"\s+", " ", val)
    if field_type == "declared_income":
        val = re.sub(r"[^\d\.]", "", val)
    return val

def extract_from_pdf(file_path: Path, filename: str, category: str) -> ExtractedDocumentInfo:
    doc_info = ExtractedDocumentInfo(
        document_id=filename,
        filename=filename,
        category=category,
        file_size_bytes=file_path.stat().st_size,
        page_count=0,
        extracted_fields={},
        raw_text_snippet="",
        integrity_notes=[],
        extraction_status="success"
    )

    try:
        reader = pypdf.PdfReader(str(file_path))
        doc_info.page_count = len(reader.pages)
        
        full_text = ""
        page_texts: List[Tuple[int, str]] = []

        for idx, page in enumerate(reader.pages):
            ptext = page.extract_text() or ""
            full_text += f"\n--- Page {idx + 1} ---\n" + ptext
            page_texts.append((idx + 1, ptext))

        if not full_text.strip():
            doc_info.extraction_status = "unreadable"
            doc_info.integrity_notes.append("No embedded digital text layer found in PDF. Scanned file requires OCR.")
            return doc_info

        doc_info.raw_text_snippet = full_text[:600]

        for field_name, patterns in PATTERNS.items():
            found = False
            for page_num, ptext in page_texts:
                if found:
                    break
                for pat in patterns:
                    match = re.search(pat, ptext, re.IGNORECASE)
                    if match:
                        raw_val = match.group(1)
                        cleaned = clean_extracted_value(raw_val, field_name)
                        if cleaned:
                            doc_info.extracted_fields[field_name] = ExtractedField(
                                field_name=field_name,
                                value=cleaned,
                                confidence=0.95,
                                source_document=filename,
                                page_number=page_num,
                                raw_context=match.group(0).strip(),
                                is_readable=True
                            )
                            found = True
                            break

    except Exception as e:
        doc_info.extraction_status = "unreadable"
        doc_info.integrity_notes.append(f"Unable to read this document reliably: {str(e)}")

    return doc_info

def extract_from_image(file_path: Path, filename: str, category: str) -> ExtractedDocumentInfo:
    doc_info = ExtractedDocumentInfo(
        document_id=filename,
        filename=filename,
        category=category,
        file_size_bytes=file_path.stat().st_size,
        page_count=1,
        extracted_fields={},
        raw_text_snippet="",
        integrity_notes=[],
        extraction_status="success"
    )

    try:
        with Image.open(file_path) as img:
            width, height = img.size
            fmt = img.format
            doc_info.integrity_notes.append(f"Image format: {fmt}, Dimensions: {width}x{height}px")
            if width < 300 or height < 300:
                doc_info.integrity_notes.append("Low resolution image detected: OCR readability may be compromised.")

        doc_info.extraction_status = "partial"
        doc_info.raw_text_snippet = f"[Image Document: {filename}] Validated visual format {fmt}."
    except Exception as e:
        doc_info.extraction_status = "unreadable"
        doc_info.integrity_notes.append(f"Image processing failed: {str(e)}")

    return doc_info

def process_uploaded_document(file_path: Path, filename: str, category: str) -> ExtractedDocumentInfo:
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        return extract_from_pdf(file_path, filename, category)
    elif suffix in [".jpg", ".jpeg", ".png"]:
        return extract_from_image(file_path, filename, category)
    else:
        info = ExtractedDocumentInfo(
            document_id=filename,
            filename=filename,
            category=category,
            file_size_bytes=file_path.stat().st_size,
            page_count=0,
            extraction_status="unreadable"
        )
        info.integrity_notes.append(f"Unsupported file format {suffix}")
        return info

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
REPORT_DIR = DATA_DIR / "reports"
DB_PATH = DATA_DIR / "docusure.db"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

# Security Limits
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB per file limit
MAX_FILES_PER_SUBMISSION = 10           # Maximum 10 files per application
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

# Magic byte signatures for secure MIME validation
FILE_SIGNATURES = {
    "pdf": [b"%PDF"],
    "jpeg": [b"\xff\xd8\xff"],
    "png": [b"\x89PNG\r\n\x1a\n"]
}

# Application Categories
APPLICATION_CATEGORIES = {
    "scholarship": {
        "title": "Scholarship Application",
        "description": "Validation for merit and need-based educational scholarship submissions.",
        "required_documents": [
            {"type": "application_form", "label": "Application Form", "mandatory": True},
            {"type": "identity_proof", "label": "Identity Proof (Govt ID / Passport)", "mandatory": True},
            {"type": "income_certificate", "label": "Income Certificate / Proof", "mandatory": True},
            {"type": "address_proof", "label": "Address Proof", "mandatory": True},
            {"type": "academic_transcript", "label": "Academic Transcript / Marksheet", "mandatory": False}
        ]
    },
    "government_scheme": {
        "title": "Government Scheme Application",
        "description": "Validation for state and national citizen welfare scheme eligibility.",
        "required_documents": [
            {"type": "application_form", "label": "Application Form", "mandatory": True},
            {"type": "identity_proof", "label": "Identity Proof (National ID)", "mandatory": True},
            {"type": "address_proof", "label": "Domicile / Address Certificate", "mandatory": True},
            {"type": "income_certificate", "label": "Income Certificate", "mandatory": False}
        ]
    },
    "income_based": {
        "title": "Income-Based Application",
        "description": "Targeted validation for subsidies, waivers, and income-capped programs.",
        "required_documents": [
            {"type": "application_form", "label": "Application Form", "mandatory": True},
            {"type": "income_certificate", "label": "Income Certificate / Salary Slip", "mandatory": True},
            {"type": "identity_proof", "label": "Identity Proof", "mandatory": True}
        ]
    },
    "identity_address": {
        "title": "Identity and Address Verification",
        "description": "Cross-verification between primary identity cards and secondary utility/address proofs.",
        "required_documents": [
            {"type": "identity_proof", "label": "Primary Identity Proof", "mandatory": True},
            {"type": "address_proof", "label": "Address Proof (Utility Bill / Bank Statement)", "mandatory": True}
        ]
    },
    "custom": {
        "title": "Custom Application",
        "description": "Configurable verification workflow based on custom organizational rules.",
        "required_documents": [
            {"type": "application_form", "label": "Application Form", "mandatory": True},
            {"type": "supporting_document", "label": "Supporting Document", "mandatory": True}
        ]
    }
}

# AI Settings (Optional Gemini / OpenAI key via environment)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
AI_ENABLED = bool(GEMINI_API_KEY or OPENAI_API_KEY)

# Platform metadata
BRAND_NAME = "Docusure AI"
TAGLINE = "Verify Documents. Validate Applications. Ensure Compliance."
SECONDARY_TAGLINE = "Smarter document verification. Clearer decisions. Greater confidence."
SYSTEM_VERSION = "2.4.0-stable"

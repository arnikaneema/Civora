# Docusure AI

> **Verify Documents. Validate Applications. Ensure Compliance.**  
> *“Smarter document verification. Clearer decisions. Greater confidence.”*

---

## Executive Summary

**Docusure AI** is a production-grade, full-stack document intelligence platform built to solve the challenge:
> **“AI-Powered Application Validation, Document Authentication, and Regulatory Compliance Verification.”**

Rather than relying on opaque scores or superficial prototypes, Docusure AI provides a genuinely functional, evidence-linked verification pipeline. It automatically parses digital and scanned application documents, checks completeness against dynamic checklists, flags cross-document inconsistencies (such as name or income mismatches), executes cryptographic document integrity checks, evaluates applications against versioned regulatory compliance rules, and generates professional, downloadable PDF verification reports.

---

## Key Capabilities & Features

### 1. Transparent Brand Identity & UI/UX
- **Distinctive Logo:** Custom SVG combining a document contour, defensive shield, and high-confidence checkmark.
- **Modern SaaS Aesthetics:** Tailwind CSS theme leveraging Deep Navy (`#10233F`), Primary Blue (`#2563EB`), Light Blue (`#EFF6FF`), Slate text, and semantically tinted status cards.
- **Privacy-First Welcome Screen:** Premium introductory screen displayed on first visit without collecting personal details, government IDs, or requiring role registration.

### 2. High-Performance Document Processing Pipeline
- **FastAPI Backend (Python 3.11):** High-throughput asynchronous endpoints with strict Pydantic schemas.
- **Digital Document Extraction (`pypdf` & Pillow):** Reads text streams, detects page counts, inspects metadata timestamps, and extracts key entities (Applicant Name, Date of Birth, Declared Income, Address, Expiry Dates, Document Reference Numbers) while tracking exact page numbers and document origins.
- **Byte Signature & Security Validation:** Enforces magic byte headers (`%PDF`, JPEG, PNG) to prevent disguised executable uploads, rejects files exceeding 10 MB, and isolates document streams.

### 3. Deterministic Application Validation Engine
- **Document Completeness:** Checks mandatory vs. optional uploads according to configurable application categories.
- **Cross-Document Consistency:** Calculates fuzzy sequence matching and exact identity equality across documents (e.g., Application Form vs. Government Identity Card), categorizing slight variations for review and alerting on severe mismatches.
- **Financial Cross-Verification:** Evaluates declared income against salary/income certificates and flags conflicting values.
- **Chronological & Range Validation:** Identifies expired documents, impossible temporal sequences (issue date succeeding expiry), and values exceeding scheme brackets.

### 4. Document Authentication & Integrity Checks
- **Metadata Inspection:** Analyzes PDF catalogue structure, detects encryption, and flags post-issuance modification discrepancies between creation and modification timestamps.
- **Scope Transparency:** Explicitly displays: `Official issuer verification was not performed.` Documents are verified algorithmically on internal integrity and consistency; Docusure AI does not fabricate issuer authentication certificates.

### 5. Configurable Regulatory Compliance Matrix
- **Demonstration Rules Engine:** Pre-configured with versioned, source-backed rules for:
  - *Scholarship Applications:* Income ceiling checks (INR 300,000 threshold), mandatory government ID, and address verification.
  - *Government Schemes:* Age eligibility (18–60 years) and state domicile residency.
  - *Income-Based Schemes:* Tier-1 subsidy income ceiling verification.
- **Clear Rule Outcomes:** Every rule reports `Passed`, `Failed`, `Needs Review`, or `Not Checked`. Missing evidence never produces a silent pass.

### 6. Application Readiness & Risk Checklist
- Highlights practical hurdles delaying institutional approval (e.g. missing certificates, expiring credentials, name variances) under the transparent moniker *“Potential Application Risk”* rather than false accusations of fraud.

### 7. Authorised Human Review Workflow
- Structured review interface allowing human auditors to mark individual findings as `Confirmed Issue`, `Resolved`, `False Positive`, or `Requires Further Investigation`, appending immutable review events to the audit trail without overwriting raw algorithmic findings.

### 8. Downloadable Official PDF Report (`ReportLab`)
- Server-side generator creating high-resolution verification reports complete with Docusure branding, application summary, processed document manifests, detailed finding tables with page citations, compliance outcomes, human audit logs, and legal disclaimers.

### 9. Three Synthetic Demonstration Scenarios
- **Scenario A (Complete Application):** All required files and fields present; passes configured rules.
- **Scenario B (Missing Information):** Missing mandatory Income Certificate and absent Date of Birth.
- **Scenario C (Inconsistent Information):** Applicant name mismatch (*Arun Kumar Sharma* vs. *Arun K. Verma*) and declared income exceeding the rule ceiling.

---

## Technical Stack & Architecture

```
docusure-ai/
├── backend/
│   ├── config.py                 # Security thresholds, file limits, schemas & categories
│   ├── main.py                   # FastAPI application with REST endpoints
│   ├── models/
│   │   └── schemas.py            # Pydantic schemas (Findings, Compliance, Readiness, Records)
│   ├── database/
│   │   └── db.py                 # SQLite persistence layer and audit log
│   ├── engine/
│   │   ├── extractor.py          # Document parsing (pypdf, Pillow) with page tracking
│   │   ├── integrity.py          # PDF metadata & structural integrity checks
│   │   ├── validator.py          # Deterministic completeness, cross-doc & date checks
│   │   ├── compliance.py         # Configurable, versioned regulatory rule engine
│   │   ├── ai_helper.py          # Optional AI explanation layer with prompt injection defense
│   │   └── report_generator.py   # ReportLab PDF report generator
│   ├── sample_data/
│   │   └── generator.py          # Synthetic demo PDF scenario generator
│   └── tests/
│       ├── test_validator.py     # Unit tests for deterministic validation rules
│       └── test_api.py           # API endpoint, file validation & security tests
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Logo.tsx          # Custom SVG Logo (document + shield + checkmark)
    │   │   ├── Navbar.tsx        # Responsive header with smooth anchor navigation
    │   │   ├── Footer.tsx        # Footer with prototype disclaimers & legal links
    │   │   ├── WelcomeScreen.tsx # Introductory privacy-first welcome screen
    │   │   ├── ReviewModal.tsx   # Human reviewer audit modal
    │   │   ├── DemoModal.tsx     # 3-scenario synthetic testing sandbox
    │   │   └── LegalModals.tsx   # Privacy & Terms of Service dialogs
    │   ├── pages/
    │   │   ├── HomePage.tsx      # Comprehensive SaaS homepage with original graphics
    │   │   ├── Dashboard.tsx     # SaaS metrics, search, filters & records table
    │   │   ├── NewVerification.tsx # File drag-and-drop & dynamic checklists
    │   │   └── VerificationResults.tsx # Comprehensive findings & report download
    │   ├── services/
    │   │   └── api.ts            # Client API bridge
    │   └── types/
    │       └── index.ts          # TypeScript type definitions
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Installation & Local Execution

### Prerequisites
- **Python:** 3.11+
- **Node.js:** v20+

### 1. Backend Setup
From the repository root:
```bash
# Install backend dependencies
python -m pip install -r backend/requirements.txt

# Start the FastAPI backend server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now live at `http://127.0.0.1:8000`. You can explore interactive Swagger documentation at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
The web application is now accessible at `http://localhost:5173`.

Alternatively, on Windows you can simply double-click:
- `run_backend.bat`
- `run_frontend.bat`

---

## Running Automated Tests

A comprehensive suite of automated tests verifies the deterministic validation engine, security safeguards, file signature filters, and report generation:

```bash
# Run backend test suite
python -m pytest -o pythonpath=. backend/tests -v
```

All 11 unit and API test cases validate:
- System health and category retrieval
- Rejection of unsupported executable extensions
- Rejection of spoofed files (extension mismatch vs. magic bytes)
- Name similarity algorithms (distinguishing typos from severe mismatches)
- Chronological sequence detection
- End-to-end execution of demonstration scenarios
- Generation and download of valid PDF verification reports

---

## Security, Privacy & Responsible AI Review

1. **Authentication Scope:** Docusure AI strictly declares: *“Official issuer verification was not performed.”* It clearly distinguishes between technical format checks, internal data consistency, and authoritative registry verification.
2. **Untrusted Data Handling:** All document text is treated as untrusted user input. Any embedded prompts inside documents cannot override system rules, alter verification outcomes, or execute server code.
3. **Data Retention & Purging:** Applications and document streams are stored locally in the session SQLite database. Users can click **Purge Record** in the dashboard to immediately delete the file payload and database records.
4. **Least-Privilege Logging:** Full-text document dumps and sensitive PII are not logged to stdout.
5. **Robust Deterministic Fallback:** If no AI API key is configured or external services are unreachable, 100% of validation, consistency checks, compliance evaluations, and PDF generation continue to function deterministically.

---

## Deployment Instructions

### Deploying Frontend to Netlify
1. Connect your repository to Netlify with base directory set to `frontend`.
2. Build command: `npm run build`
3. Publish directory: `frontend/dist`
4. The included `frontend/netlify.toml` and `frontend/public/_redirects` automatically route single-page application URLs to `/index.html` and proxy API calls.

### Deploying Backend to Render / Railway / Fly.io
1. Deploy the `backend/` directory using Python 3.11 runtime.
2. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3. Set optional environment variable `GEMINI_API_KEY` or `OPENAI_API_KEY` for natural language enrichment.
4. Update the Netlify rewrite target in `frontend/netlify.toml` with your deployed backend URL.

---

## License & Disclaimers

Docusure AI is provided as an advanced educational and technical demonstration for document verification, application validation, and compliance automation. Demonstration rules and synthetic scenarios are illustrative and do not constitute official statutory decisions.

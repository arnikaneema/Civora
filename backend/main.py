import os
import uuid
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Response, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from backend.config import (
    APPLICATION_CATEGORIES, MAX_FILE_SIZE_BYTES, MAX_FILES_PER_SUBMISSION,
    ALLOWED_EXTENSIONS, FILE_SIGNATURES, UPLOAD_DIR, SYSTEM_VERSION, BRAND_NAME,
    TAGLINE, SECONDARY_TAGLINE, AI_ENABLED
)
from backend.models.schemas import (
    ApplicationRecord, ApplicationCreateResponse, OverallStatus,
    HumanReviewRequest, HumanReviewEvent, CheckStatus
)
from backend.database.db import (
    init_db, save_application, get_application, list_applications,
    delete_application, add_human_review
)
from backend.engine.extractor import process_uploaded_document
from backend.engine.integrity import check_pdf_integrity
from backend.engine.validator import validate_application
from backend.engine.compliance import evaluate_compliance_rules, DEMO_COMPLIANCE_RULES
from backend.engine.ai_helper import enhance_finding_explanations
from backend.engine.report_generator import generate_pdf_report
from backend.sample_data.generator import SAMPLE_DIR, generate_scenario_files

# Initialize database
init_db()

# Initialize FastAPI app
app = FastAPI(
    title=f"{BRAND_NAME} API",
    description="Intelligent Application Validation, Document Authentication & Regulatory Compliance Verification API",
    version=SYSTEM_VERSION
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def validate_magic_bytes(file_bytes: bytes, filename: str) -> bool:
    lower_name = filename.lower()
    if lower_name.endswith(".pdf"):
        return file_bytes.startswith(b"%PDF")
    elif lower_name.endswith((".jpg", ".jpeg")):
        return file_bytes.startswith(b"\xff\xd8\xff")
    elif lower_name.endswith(".png"):
        return file_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    return False

def compute_overall_status(findings, compliance_results) -> Tuple[OverallStatus, str]:
    has_failed_mand = any(f.status == CheckStatus.FAILED for f in findings)
    has_failed_comp = any(c.outcome == CheckStatus.FAILED for c in compliance_results)
    has_review = any(f.status == CheckStatus.NEEDS_REVIEW for f in findings) or any(c.outcome == CheckStatus.NEEDS_REVIEW for c in compliance_results)

    if has_failed_mand or has_failed_comp:
        return OverallStatus.ACTION_REQUIRED, "One or more mandatory requirements failed or required information is missing."
    elif has_review:
        return OverallStatus.NEEDS_REVIEW, "One or more potential inconsistencies require human reviewer inspection."
    else:
        return OverallStatus.PASSED_CONFIGURED, "All applicable configured checks passed. Does not guarantee official issuer authenticity."

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "brand": BRAND_NAME,
        "tagline": TAGLINE,
        "version": SYSTEM_VERSION,
        "ai_active": AI_ENABLED,
        "max_file_size_mb": MAX_FILE_SIZE_BYTES / (1024 * 1024),
        "max_files": MAX_FILES_PER_SUBMISSION
    }

@app.get("/api/categories")
def get_categories():
    return APPLICATION_CATEGORIES

@app.get("/api/rules")
def get_rules():
    return DEMO_COMPLIANCE_RULES

@app.post("/api/verify")
async def verify_application(
    category: str = Form(...),
    files: List[UploadFile] = File(...),
    categories: Optional[List[str]] = Form(None)
):
    if category not in APPLICATION_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category '{category}'. Available: {list(APPLICATION_CATEGORIES.keys())}")

    if not files:
        raise HTTPException(status_code=400, detail="At least one document must be uploaded.")

    if len(files) > MAX_FILES_PER_SUBMISSION:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_FILES_PER_SUBMISSION} files allowed per application.")

    app_id = f"DOC-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
    app_folder = UPLOAD_DIR / app_id
    app_folder.mkdir(parents=True, exist_ok=True)

    extracted_docs = []
    integrity_findings = []

    # Map categories per file if provided
    doc_categories = categories or []

    for idx, upload in enumerate(files):
        # Validate filename and path safety
        safe_filename = Path(upload.filename).name
        ext = Path(safe_filename).suffix.lower()

        if ext not in ALLOWED_EXTENSIONS:
            shutil.rmtree(app_folder, ignore_errors=True)
            raise HTTPException(status_code=400, detail=f"Unsupported format '{ext}' in {safe_filename}. Supported: PDF, JPG, JPEG, PNG.")

        content = await upload.read()
        if len(content) == 0:
            shutil.rmtree(app_folder, ignore_errors=True)
            raise HTTPException(status_code=400, detail=f"File '{safe_filename}' is empty.")

        if len(content) > MAX_FILE_SIZE_BYTES:
            shutil.rmtree(app_folder, ignore_errors=True)
            raise HTTPException(status_code=400, detail=f"File '{safe_filename}' exceeds 10 MB limit.")

        # Signature verification (magic bytes)
        if not validate_magic_bytes(content, safe_filename):
            shutil.rmtree(app_folder, ignore_errors=True)
            raise HTTPException(status_code=400, detail=f"Security verification failed: File content of '{safe_filename}' does not match extension header signature.")

        # Save to disk securely
        saved_file_path = app_folder / f"{idx}_{safe_filename}"
        with open(saved_file_path, "wb") as f_out:
            f_out.write(content)

        assigned_cat = doc_categories[idx] if idx < len(doc_categories) else "supporting_document"
        doc_info = process_uploaded_document(saved_file_path, safe_filename, assigned_cat)
        extracted_docs.append(doc_info)

        # Run integrity checks if PDF
        if ext == ".pdf":
            int_findings = check_pdf_integrity(saved_file_path, safe_filename)
            integrity_findings.extend(int_findings)

    # Run deterministic application validation
    val_findings, readiness_items, consolidated_fields = validate_application(category, extracted_docs)
    all_findings = val_findings + integrity_findings

    # Run regulatory compliance evaluation
    compliance_results = evaluate_compliance_rules(category, extracted_docs, consolidated_fields)

    # Optional AI-assisted enrichment
    all_findings = enhance_finding_explanations(all_findings, APPLICATION_CATEGORIES[category]["title"])

    # Compute overall status
    overall_status, status_summary = compute_overall_status(all_findings, compliance_results)

    total_checks = len(all_findings) + len(compliance_results)
    passed_checks = sum(1 for f in all_findings if f.status == CheckStatus.PASSED) + sum(1 for c in compliance_results if c.outcome == CheckStatus.PASSED)
    failed_checks = sum(1 for f in all_findings if f.status == CheckStatus.FAILED) + sum(1 for c in compliance_results if c.outcome == CheckStatus.FAILED)
    review_checks = sum(1 for f in all_findings if f.status == CheckStatus.NEEDS_REVIEW) + sum(1 for c in compliance_results if c.outcome == CheckStatus.NEEDS_REVIEW)
    not_checked_checks = total_checks - (passed_checks + failed_checks + review_checks)

    record = ApplicationRecord(
        application_id=app_id,
        category=category,
        category_title=APPLICATION_CATEGORIES[category]["title"],
        submission_date=datetime.now().strftime("%d %b %Y, %H:%M"),
        processing_date=datetime.now().strftime("%d %b %Y, %H:%M"),
        overall_status=overall_status,
        status_summary=status_summary,
        total_checks=total_checks,
        passed_checks=passed_checks,
        failed_checks=failed_checks,
        review_checks=review_checks,
        not_checked_checks=not_checked_checks,
        findings=all_findings,
        compliance_results=compliance_results,
        readiness_checklist=readiness_items,
        documents=extracted_docs,
        human_reviews=[],
        is_demo=False
    )

    # Generate PDF report
    generate_pdf_report(record)

    # Save to SQLite DB
    save_application(record)

    return record

@app.get("/api/applications")
def list_all_applications(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    return list_applications(category_filter=category, status_filter=status, search=search)

@app.get("/api/applications/{application_id}")
def get_application_details(application_id: str):
    record = get_application(application_id)
    if not record:
        raise HTTPException(status_code=404, detail="Application record not found.")
    return record

@app.get("/api/applications/{application_id}/report.pdf")
def download_application_report(application_id: str):
    record = get_application(application_id)
    if not record:
        raise HTTPException(status_code=404, detail="Application record not found.")

    from backend.config import REPORT_DIR
    pdf_path = REPORT_DIR / f"{application_id}_report.pdf"
    if not pdf_path.exists():
        # Re-generate if missing
        generate_pdf_report(record)

    return FileResponse(
        path=str(pdf_path),
        filename=f"Docusure_{application_id}_Report.pdf",
        media_type="application/pdf"
    )

@app.delete("/api/applications/{application_id}")
def delete_application_record(application_id: str):
    # Data retention compliance / deletion
    record = get_application(application_id)
    if not record:
        raise HTTPException(status_code=404, detail="Application record not found.")

    app_folder = UPLOAD_DIR / application_id
    if app_folder.exists():
        shutil.rmtree(app_folder, ignore_errors=True)

    from backend.config import REPORT_DIR
    pdf_path = REPORT_DIR / f"{application_id}_report.pdf"
    if pdf_path.exists():
        os.remove(pdf_path)

    delete_application(application_id)
    return {"status": "success", "message": f"Application {application_id} and all associated document streams purged successfully."}

@app.post("/api/applications/{application_id}/review")
def add_review(application_id: str, req: HumanReviewRequest):
    record = get_application(application_id)
    if not record:
        raise HTTPException(status_code=404, detail="Application record not found.")

    review_event = HumanReviewEvent(
        review_id=f"REV-{uuid.uuid4().hex[:6].upper()}",
        application_id=application_id,
        finding_id=req.finding_id,
        decision=req.decision,
        reviewer_name=req.reviewer_name,
        notes=req.notes,
        timestamp=datetime.now().strftime("%d %b %Y, %H:%M:%S")
    )

    updated = add_human_review(review_event)
    # Re-generate report to include review audit trail
    if updated:
        generate_pdf_report(updated)
    return updated

@app.post("/api/demo/run/{scenario_key}")
def run_demo_scenario(scenario_key: str):
    """
    Executes actual end-to-end extraction and validation on synthetic scenario files
    without requiring any user personal data.
    """
    generate_scenario_files()

    category = "scholarship"
    if scenario_key == "scenario_a":
        app_id = "DEMO-2026-COMPLETE-A"
        file_specs = [
            ("demo_a_app_form.pdf", "application_form"),
            ("demo_a_id_proof.pdf", "identity_proof"),
            ("demo_a_income_cert.pdf", "income_certificate"),
            ("demo_a_address_proof.pdf", "address_proof"),
        ]
    elif scenario_key == "scenario_b":
        app_id = "DEMO-2026-MISSING-B"
        file_specs = [
            ("demo_b_app_form.pdf", "application_form"),
            ("demo_b_id_proof.pdf", "identity_proof")
            # Missing income_certificate & address_proof
        ]
    elif scenario_key == "scenario_c":
        app_id = "DEMO-2026-INCONSISTENT-C"
        file_specs = [
            ("demo_c_app_form.pdf", "application_form"),
            ("demo_c_id_proof.pdf", "identity_proof"),
            ("demo_c_income_cert.pdf", "income_certificate"),
            ("demo_c_address_proof.pdf", "address_proof"),
        ]
    else:
        raise HTTPException(status_code=400, detail="Unknown scenario. Choose scenario_a, scenario_b, or scenario_c.")

    extracted_docs = []
    integrity_findings = []

    for fname, cat in file_specs:
        fpath = SAMPLE_DIR / fname
        if not fpath.exists():
            generate_scenario_files()
        doc_info = process_uploaded_document(fpath, fname, cat)
        extracted_docs.append(doc_info)
        int_f = check_pdf_integrity(fpath, fname)
        integrity_findings.extend(int_f)

    val_findings, readiness_items, consolidated_fields = validate_application(category, extracted_docs)
    all_findings = val_findings + integrity_findings
    compliance_results = evaluate_compliance_rules(category, extracted_docs, consolidated_fields)

    overall_status, status_summary = compute_overall_status(all_findings, compliance_results)

    total_checks = len(all_findings) + len(compliance_results)
    passed_checks = sum(1 for f in all_findings if f.status == CheckStatus.PASSED) + sum(1 for c in compliance_results if c.outcome == CheckStatus.PASSED)
    failed_checks = sum(1 for f in all_findings if f.status == CheckStatus.FAILED) + sum(1 for c in compliance_results if c.outcome == CheckStatus.FAILED)
    review_checks = sum(1 for f in all_findings if f.status == CheckStatus.NEEDS_REVIEW) + sum(1 for c in compliance_results if c.outcome == CheckStatus.NEEDS_REVIEW)
    not_checked_checks = total_checks - (passed_checks + failed_checks + review_checks)

    record = ApplicationRecord(
        application_id=app_id,
        category=category,
        category_title="Scholarship Application (Demonstration)",
        submission_date=datetime.now().strftime("%d %b %Y, %H:%M"),
        processing_date=datetime.now().strftime("%d %b %Y, %H:%M"),
        overall_status=overall_status,
        status_summary=status_summary,
        total_checks=total_checks,
        passed_checks=passed_checks,
        failed_checks=failed_checks,
        review_checks=review_checks,
        not_checked_checks=not_checked_checks,
        findings=all_findings,
        compliance_results=compliance_results,
        readiness_checklist=readiness_items,
        documents=extracted_docs,
        human_reviews=[],
        is_demo=True
    )

    generate_pdf_report(record)
    save_application(record)
    return record

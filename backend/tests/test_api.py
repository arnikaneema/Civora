import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["brand"] == "Docusure AI"
    assert data["status"] == "healthy"

def test_categories_endpoint():
    res = client.get("/api/categories")
    assert res.status_code == 200
    cats = res.json()
    assert "scholarship" in cats
    assert "government_scheme" in cats

def test_run_demo_scenario_a():
    res = client.post("/api/demo/run/scenario_a")
    assert res.status_code == 200
    data = res.json()
    assert data["application_id"] == "DEMO-2026-COMPLETE-A"
    assert "Passed" in data["overall_status"]
    assert data["is_demo"] is True

def test_run_demo_scenario_b():
    res = client.post("/api/demo/run/scenario_b")
    assert res.status_code == 200
    data = res.json()
    assert data["application_id"] == "DEMO-2026-MISSING-B"
    assert data["failed_checks"] > 0

def test_download_report_pdf():
    # Ensure scenario A is created
    client.post("/api/demo/run/scenario_a")
    res = client.get("/api/applications/DEMO-2026-COMPLETE-A/report.pdf")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000

def test_reject_unsupported_file_extension():
    # Attempt to upload an executable or unsupported file
    files = [
        ("files", ("malicious.exe", b"MZDummyExecutableBytes", "application/octet-stream"))
    ]
    res = client.post("/api/verify", data={"category": "scholarship"}, files=files)
    assert res.status_code == 400
    assert "Unsupported format" in res.json()["detail"]

def test_reject_fake_extension_signature_mismatch():
    # Attempt to upload text masquerading as a PDF
    files = [
        ("files", ("fake.pdf", b"This is just plain text, not a real PDF file header", "application/pdf"))
    ]
    res = client.post("/api/verify", data={"category": "scholarship"}, files=files)
    assert res.status_code == 400
    assert "Security verification failed" in res.json()["detail"]

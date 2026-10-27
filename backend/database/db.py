import sqlite3
import json
from typing import List, Optional, Dict, Any
from backend.config import DB_PATH
from backend.models.schemas import ApplicationRecord, HumanReviewEvent

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                application_id TEXT PRIMARY KEY,
                category TEXT NOT NULL,
                category_title TEXT NOT NULL,
                submission_date TEXT NOT NULL,
                processing_date TEXT NOT NULL,
                overall_status TEXT NOT NULL,
                total_checks INTEGER DEFAULT 0,
                failed_checks INTEGER DEFAULT 0,
                review_checks INTEGER DEFAULT 0,
                is_demo INTEGER DEFAULT 0,
                record_json TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS human_reviews (
                review_id TEXT PRIMARY KEY,
                application_id TEXT NOT NULL,
                finding_id TEXT NOT NULL,
                decision TEXT NOT NULL,
                reviewer_name TEXT NOT NULL,
                notes TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (application_id) REFERENCES applications (application_id)
            )
        """)
    conn.close()

def save_application(record: ApplicationRecord):
    conn = get_connection()
    with conn:
        conn.execute("""
            INSERT OR REPLACE INTO applications (
                application_id, category, category_title, submission_date, processing_date,
                overall_status, total_checks, failed_checks, review_checks, is_demo, record_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record.application_id,
            record.category,
            record.category_title,
            record.submission_date,
            record.processing_date,
            record.overall_status.value if hasattr(record.overall_status, 'value') else str(record.overall_status),
            record.total_checks,
            record.failed_checks,
            record.review_checks,
            1 if record.is_demo else 0,
            record.model_dump_json()
        ))
    conn.close()

def get_application(app_id: str) -> Optional[ApplicationRecord]:
    conn = get_connection()
    cursor = conn.execute("SELECT record_json FROM applications WHERE application_id = ?", (app_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        data = json.loads(row["record_json"])
        return ApplicationRecord(**data)
    return None

def list_applications(category_filter: Optional[str] = None, status_filter: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    query = "SELECT application_id, category, category_title, submission_date, processing_date, overall_status, total_checks, failed_checks, review_checks, is_demo FROM applications WHERE 1=1"
    params = []

    if category_filter and category_filter != "all":
        query += " AND category = ?"
        params.append(category_filter)
    
    if status_filter and status_filter != "all":
        query += " AND overall_status = ?"
        params.append(status_filter)

    if search and search.strip():
        query += " AND (application_id LIKE ? OR category_title LIKE ?)"
        s = f"%{search.strip()}%"
        params.extend([s, s])

    query += " ORDER BY submission_date DESC"
    cursor = conn.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append({
            "application_id": r["application_id"],
            "category": r["category"],
            "category_title": r["category_title"],
            "submission_date": r["submission_date"],
            "processing_date": r["processing_date"],
            "overall_status": r["overall_status"],
            "total_checks": r["total_checks"],
            "failed_checks": r["failed_checks"],
            "review_checks": r["review_checks"],
            "is_demo": bool(r["is_demo"])
        })
    return results

def delete_application(app_id: str) -> bool:
    conn = get_connection()
    with conn:
        conn.execute("DELETE FROM human_reviews WHERE application_id = ?", (app_id,))
        cursor = conn.execute("DELETE FROM applications WHERE application_id = ?", (app_id,))
        count = cursor.rowcount
    conn.close()
    return count > 0

def add_human_review(review: HumanReviewEvent) -> Optional[ApplicationRecord]:
    conn = get_connection()
    with conn:
        conn.execute("""
            INSERT INTO human_reviews (review_id, application_id, finding_id, decision, reviewer_name, notes, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            review.review_id,
            review.application_id,
            review.finding_id,
            review.decision,
            review.reviewer_name,
            review.notes,
            review.timestamp
        ))
    conn.close()

    app = get_application(review.application_id)
    if app:
        app.human_reviews.append(review)
        save_application(app)
        return app
    return None

#!/usr/bin/env python3
import os
import sys
import sqlite3
import fitz  # PyMuPDF
import asyncio

# Add backend to path to import app services
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
sys.path.insert(0, backend_path)
os.environ["CELERY_TASK_ALWAYS_EAGER"] = "True"

from app.services import rag_service, storage_service

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "jeeapp.db")
STATIC_PDF_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "static", "uploads", "pdfs")

def wrap_text(text, font_size, max_w):
    """Simple text wrapper approximating Helvetica char widths."""
    char_w = font_size * 0.5  # Helvetica average char width
    max_chars = int(max_w / char_w)
    
    words = text.split(" ")
    lines = []
    current_line = []
    current_len = 0
    
    for word in words:
        if "\n" in word:
            parts = word.split("\n")
            for idx, part in enumerate(parts):
                if idx > 0:
                    lines.append(" ".join(current_line))
                    current_line = []
                    current_len = 0
                if part:
                    current_line.append(part)
                    current_len += len(part) + 1
            continue
            
        if current_len + len(word) <= max_chars:
            current_line.append(word)
            current_len += len(word) + 1
        else:
            lines.append(" ".join(current_line))
            current_line = [word]
            current_len = len(word)
            
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def build_pdf_notes(title, subject_name, summary_markdown):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4
    
    # Header block
    page.draw_rect(fitz.Rect(30, 30, 565, 80), color=(0.88, 0.3, 0.4), fill=(0.98, 0.95, 0.96), width=1.5)
    page.insert_text((45, 53), f"TIM Prep Sheet: {subject_name}", fontsize=11, fontname="Helvetica-Bold", color=(0.8, 0.2, 0.3))
    page.insert_text((45, 70), title, fontsize=15, fontname="Helvetica-Bold", color=(0.1, 0.1, 0.1))
    
    y = 110
    margin_x = 40
    max_width = 515
    
    lines = summary_markdown.split("\n")
    for line in lines:
        line = line.strip()
        if not line:
            y += 8
            continue
            
        if y > 780:
            page = doc.new_page(width=595, height=842)
            y = 50
            
        # Parse headings
        if line.startswith("## "):
            y += 12
            page.insert_text((margin_x, y), line[3:], fontsize=13, fontname="Helvetica-Bold", color=(0.8, 0.2, 0.3))
            y += 16
        elif line.startswith("### "):
            y += 8
            page.insert_text((margin_x, y), line[4:], fontsize=11, fontname="Helvetica-Bold", color=(0.2, 0.2, 0.2))
            y += 14
        elif line.startswith("**") and line.endswith("**"):
            y += 4
            text = line.replace("**", "")
            page.insert_text((margin_x, y), text, fontsize=10, fontname="Helvetica-Bold", color=(0.1, 0.1, 0.1))
            y += 12
        elif line.startswith("- ") or line.startswith("* "):
            bullet_text = line[2:]
            wrapped_lines = wrap_text(bullet_text, font_size=10, max_w=max_width - 15)
            for idx, w_line in enumerate(wrapped_lines):
                if y > 780:
                    page = doc.new_page(width=595, height=842)
                    y = 50
                x_pos = margin_x
                if idx == 0:
                    page.insert_text((x_pos, y), "•", fontsize=12, fontname="Helvetica", color=(0.8, 0.2, 0.3))
                    x_pos += 15
                    page.insert_text((x_pos, y), w_line, fontsize=10, fontname="Helvetica", color=(0.15, 0.15, 0.15))
                else:
                    x_pos += 15
                    page.insert_text((x_pos, y), w_line, fontsize=10, fontname="Helvetica", color=(0.15, 0.15, 0.15))
                y += 13
            y += 3
        else:
            # Check for inline bold formatting, simplify for drawing
            clean_line = line.replace("**", "")
            wrapped_lines = wrap_text(clean_line, font_size=10, max_w=max_width)
            for w_line in wrapped_lines:
                if y > 780:
                    page = doc.new_page(width=595, height=842)
                    y = 50
                page.insert_text((margin_x, y), w_line, fontsize=10, fontname="Helvetica", color=(0.2, 0.2, 0.2))
                y += 13
                
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

async def run_pipeline():
    print(f"[*] Connecting to database at {DB_PATH}...")
    if not os.path.exists(DB_PATH):
        print(f"[-] Database file not found at {DB_PATH}")
        sys.exit(1)
        
    os.makedirs(STATIC_PDF_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Query topics and their subject names
    cursor.execute("""
        SELECT topics.id, topics.title, topics.summary, subjects.name
        FROM topics
        JOIN subjects ON topics.subject_id = subjects.id
    """)
    rows = cursor.fetchall()
    print(f"[*] Found {len(rows)} topics to process.")
    
    total_indexed = 0
    for topic_id, title, summary, subject_name in rows:
        print(f"\n[*] Processing Topic: '{title}' ({subject_name})")
        if not summary:
            print("  [-] Summary is empty. Skipping.")
            continue
            
        # 1. Generate PDF
        pdf_bytes = build_pdf_notes(title, subject_name, summary)
        filename = f"{topic_id}.pdf"
        filepath = os.path.join(STATIC_PDF_DIR, filename)
        
        # 2. Save locally
        with open(filepath, "wb") as f:
            f.write(pdf_bytes)
        print(f"  [+] Saved PDF notes locally: {filepath}")
        
        # 3. Upload via storage_service (which handles local static file copy and MinIO)
        object_name = f"pdfs/{filename}"
        uploaded_key = storage_service.upload_file(pdf_bytes, object_name, "application/pdf")
        
        # 4. Update topic's pdf_url in DB
        cursor.execute("UPDATE topics SET pdf_url = ? WHERE id = ?", (uploaded_key, topic_id))
        conn.commit()
        print(f"  [+] Updated pdf_url in database to: {uploaded_key}")
        
        # 5. Index PDF into Qdrant vector database
        print("  [*] Chunking and indexing PDF in Qdrant database...")
        success = rag_service.index_pdf(topic_id, pdf_bytes)
        if success:
            print(f"  [+] Successfully indexed RAG database for topic '{title}'")
            total_indexed += 1
        else:
            print(f"  [-] RAG indexing failed for topic '{title}'")
            
    conn.close()
    print(f"\n[+] Pipeline complete. Generated and indexed {total_indexed} topic notes PDFs.")

if __name__ == "__main__":
    asyncio.run(run_pipeline())

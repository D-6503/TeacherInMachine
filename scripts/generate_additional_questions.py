#!/usr/bin/env python3
import os
import sys
import sqlite3
import asyncio

# Setup path
scripts_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(os.path.dirname(scripts_dir), "backend")
sys.path.insert(0, backend_dir)

from tasks.ai_tasks import _run_generation

async def generate_all():
    db_path = os.path.join(backend_dir, "jeeapp.db")
    if not os.path.exists(db_path):
        print(f"[-] Database not found at {db_path}")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title FROM topics")
    topics = cursor.fetchall()
    conn.close()
    
    print(f"[*] Found {len(topics)} topics. Generating 2 additional questions per Bloom level...")
    for idx, (topic_id, title) in enumerate(topics):
        print(f"\n[*] [{idx+1}/{len(topics)}] Generating questions for '{title}' (ID: {topic_id})...")
        try:
            res = await _run_generation(topic_id, count_per_level=2)
            print(f"  [+] Result: {res}")
        except Exception as e:
            print(f"  [-] Failed: {e}")

if __name__ == "__main__":
    asyncio.run(generate_all())

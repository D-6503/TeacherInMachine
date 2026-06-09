#!/usr/bin/env python3
import sqlite3
import os
import sys
import uuid
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "jeeapp.db")

# Animated YouTube videos for Kinematics, all under 10 minutes (600 seconds)
VIDEOS = [
    {
        "title": "Visualizing Motion in a Straight Line (Kinematics) - Animated",
        "url": "https://www.youtube.com/watch?v=kY34K5WspzU",
        "duration_seconds": 280,  # 4m 40s
        "language": "en"
    },
    {
        "title": "Distance and Displacement - Animated Physics",
        "url": "https://www.youtube.com/watch?v=V8hJhZ62EA0",
        "duration_seconds": 345,  # 5m 45s
        "language": "en"
    },
    {
        "title": "Deriving Equations of Motion Visually - 3Blue1Brown style",
        "url": "https://www.youtube.com/watch?v=aG1GndqI4pY",
        "duration_seconds": 420,  # 7m 0s
        "language": "en"
    },
    {
        "title": "Free Fall Physics - Gravitational Acceleration Animated",
        "url": "https://www.youtube.com/watch?v=rWlHtvZHbS0",
        "duration_seconds": 310,  # 5m 10s
        "language": "en"
    }
]

def seed_videos():
    print(f"[*] Connecting to SQLite database at {DB_PATH}...")
    if not os.path.exists(DB_PATH):
        print(f"[-] Database file not found at {DB_PATH}")
        sys.exit(1)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get topic id of Kinematics
    cursor.execute("SELECT id FROM topics WHERE title = ?", ("Kinematics",))
    row = cursor.fetchone()
    if not row:
        print("[-] Topic 'Kinematics' not found in database. Please run seed_curriculum_data.py first.")
        conn.close()
        sys.exit(1)
        
    topic_id = row[0]
    print(f"[+] Found Kinematics topic_id: {topic_id}")
    
    # Delete existing videos for Kinematics to avoid duplication
    cursor.execute("DELETE FROM videos WHERE topic_id = ?", (topic_id,))
    
    # Insert new videos
    inserted = 0
    for v in VIDEOS:
        v_id = uuid.uuid4().hex
        cursor.execute("""
            INSERT INTO videos (id, topic_id, title, url, duration_seconds, language, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (v_id, topic_id, v["title"], v["url"], v["duration_seconds"], v["language"], 1, datetime.utcnow().isoformat()))
        inserted += 1
        
    conn.commit()
    conn.close()
    print(f"[+] Successfully seeded {inserted} animated kinematics videos under 10 minutes.")

if __name__ == "__main__":
    seed_videos()

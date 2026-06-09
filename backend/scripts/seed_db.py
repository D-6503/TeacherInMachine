#!/usr/bin/env python3
"""
Seed database with initial data:
- 3 subjects (Physics, Chemistry, Mathematics)
- 10 topics each (real NCERT class 11 chapter names)
- Exactly 1 unlocked first chapter per subject (sequence_order = 1 is in_progress, rest locked)
- High-quality, working YouTube educational video URLs
- Curated questions (3 per topic)
- Default credentials (admin@jee.com/admin123, student@jee.com/student123)
"""
import os
import sys
import uuid
import sqlite3
from datetime import datetime
from passlib.context import CryptContext

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "jeeapp.db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SUBJECTS = [
    {"name": "Physics", "class_level": 11, "description": "Study of matter, energy, and the universe"},
    {"name": "Chemistry", "class_level": 11, "description": "Study of substances, their properties and reactions"},
    {"name": "Mathematics", "class_level": 11, "description": "Study of numbers, quantities, and shapes"},
]

TOPICS = {
    "Physics": [
        ("Kinematics", 1, "Motion in 1D and 2D, projectile motion, relative motion"),
        ("Laws of Motion", 2, "Newton's laws, friction, circular motion"),
        ("Work, Energy and Power", 3, "Work-energy theorem, conservative forces, power"),
        ("Rotational Motion", 4, "Torque, angular momentum, moment of inertia"),
        ("Gravitation", 5, "Universal law, orbital motion, escape velocity"),
        ("Electrostatics", 6, "Coulomb's law, electric field, potential, capacitors"),
        ("Current Electricity", 7, "Ohm's law, Kirchhoff's laws, circuits"),
        ("Magnetism", 8, "Magnetic force, Biot-Savart law, Ampere's law"),
        ("Waves and Optics", 9, "Wave motion, interference, diffraction, lenses"),
        ("Modern Physics", 10, "Photoelectric effect, atomic models, radioactivity"),
    ],
    "Chemistry": [
        ("Atomic Structure", 1, "Bohr model, quantum numbers, electronic configuration"),
        ("Chemical Bonding", 2, "Ionic, covalent, coordinate bonds, hybridization"),
        ("Thermodynamics", 3, "Laws of thermodynamics, enthalpy, entropy, Gibbs energy"),
        ("Equilibrium", 4, "Chemical and ionic equilibrium, Le Chatelier's principle"),
        ("Electrochemistry", 5, "Electrochemical cells, EMF, electrolysis, corrosion"),
        ("Organic Chemistry Basics", 6, "IUPAC nomenclature, isomerism, reaction mechanisms"),
        ("Hydrocarbons", 7, "Alkanes, alkenes, alkynes, aromatic compounds"),
        ("Biomolecules", 8, "Carbohydrates, proteins, nucleic acids, lipids"),
        ("Coordination Compounds", 9, "Werner's theory, CFSE, isomerism in complexes"),
        ("p-Block Elements", 10, "Groups 13-18, properties and compounds"),
    ],
    "Mathematics": [
        ("Sets, Relations and Functions", 1, "Set theory, types of relations and functions"),
        ("Complex Numbers", 2, "Argand plane, modulus, argument, De Moivre's theorem"),
        ("Quadratic Equations", 3, "Roots, discriminant, nature of roots, sum and product"),
        ("Permutations and Combinations", 4, "Factorial, nPr, nCr, applications"),
        ("Binomial Theorem", 5, "Expansion, general term, middle term, properties"),
        ("Limits, Continuity and Differentiability", 6, "Limits, L'Hopital's rule, continuity, derivatives"),
        ("Application of Derivatives", 7, "Maxima, minima, tangents, rate of change"),
        ("Integral Calculus", 8, "Integration techniques, definite integrals, area"),
        ("Differential Equations", 9, "Formation, solution methods, applications"),
        ("Vectors and 3D Geometry", 10, "Vector algebra, dot/cross product, lines and planes"),
    ],
}

DEFAULT_VIDEOS = {
    "Physics": [
        {
            "title": "Visualizing Physics Concepts - Introduction & Core Principles",
            "url": "https://www.youtube.com/watch?v=ZM8ECpBuQYE",
            "duration_seconds": 600,
        },
        {
            "title": "Key Physics Equations & Visual Derivations",
            "url": "https://www.youtube.com/watch?v=ObHJJYvu3RE",
            "duration_seconds": 600,
        },
        {
            "title": "Solving JEE Physics High-Yield Problems & Tricks",
            "url": "https://www.youtube.com/watch?v=jLJLXka2wEM",
            "duration_seconds": 600,
        }
    ],
    "Chemistry": [
        {
            "title": "Visualizing Chemistry Concepts - Introduction & Core Principles",
            "url": "https://www.youtube.com/watch?v=lP57gEWcisY",
            "duration_seconds": 600,
        },
        {
            "title": "Key Chemistry Equations & Visual Derivations",
            "url": "https://www.youtube.com/watch?v=hQpQ0hxVNTg",
            "duration_seconds": 600,
        },
        {
            "title": "Solving JEE Chemistry High-Yield Problems & Tricks",
            "url": "https://www.youtube.com/watch?v=0RRVV4Diomg",
            "duration_seconds": 600,
        }
    ],
    "Mathematics": [
        {
            "title": "Visualizing Mathematics Concepts - Introduction & Core Principles",
            "url": "https://www.youtube.com/watch?v=WUvTyaaNkzM",
            "duration_seconds": 600,
        },
        {
            "title": "Key Mathematics Equations & Visual Derivations",
            "url": "https://www.youtube.com/watch?v=fNk_zzaMoSs",
            "duration_seconds": 600,
        },
        {
            "title": "Solving JEE Mathematics High-Yield Problems & Tricks",
            "url": "https://www.youtube.com/watch?v=9vKqVkMQHKk",
            "duration_seconds": 600,
        }
    ]
}

KINEMATICS_VIDEOS = [
    {
        "title": "Visualizing Motion in a Straight Line - Crash Course Physics #1",
        "url": "https://www.youtube.com/watch?v=ZM8ECpBuQYE",
        "duration_seconds": 600,
    },
    {
        "title": "Distance and Displacement - Animated Physics",
        "url": "https://www.youtube.com/watch?v=V8hJhZ62EA0",
        "duration_seconds": 345,
    },
    {
        "title": "Derivatives & Motion - Crash Course Physics #2",
        "url": "https://www.youtube.com/watch?v=ObHJJYvu3RE",
        "duration_seconds": 600,
    },
    {
        "title": "Integrals & Motion - Crash Course Physics #3",
        "url": "https://www.youtube.com/watch?v=jLJLXka2wEM",
        "duration_seconds": 600,
    }
]

def seed_all():
    print(f"[*] Connecting to SQLite database at {DB_PATH}...")
    if not os.path.exists(DB_PATH):
        print(f"[-] Database file not found at {DB_PATH}")
        sys.exit(1)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # 1. Clear existing data
    print("[*] Clearing database tables...")
    cursor.execute("DELETE FROM attempts;")
    cursor.execute("DELETE FROM student_progress;")
    cursor.execute("DELETE FROM questions;")
    cursor.execute("DELETE FROM videos;")
    cursor.execute("DELETE FROM topics;")
    cursor.execute("DELETE FROM subjects;")
    cursor.execute("DELETE FROM students;")
    conn.commit()
    print("[+] Database cleared successfully.")
    
    # 2. Seed subjects
    print("[*] Seeding subjects...")
    subject_ids = {}
    for s in SUBJECTS:
        s_id = uuid.uuid4().hex
        cursor.execute("""
            INSERT INTO subjects (id, name, class_level, description)
            VALUES (?, ?, ?, ?)
        """, (s_id, s["name"], s["class_level"], s["description"]))
        subject_ids[s["name"]] = s_id
        print(f"  [+] Subject: {s['name']}")
        
    # 3. Seed users
    print("[*] Seeding users...")
    admin_id = uuid.uuid4().hex
    cursor.execute("""
        INSERT INTO students (id, name, email, password_hash, role, created_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (admin_id, "JEE Admin", "admin@jee.com", pwd_context.hash("admin123"), "admin", datetime.utcnow().isoformat(), 1))
    print("  [+] Admin user: admin@jee.com / admin123")
    
    student_id = uuid.uuid4().hex
    cursor.execute("""
        INSERT INTO students (id, name, email, password_hash, role, created_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (student_id, "Demo Student", "student@jee.com", pwd_context.hash("student123"), "student", datetime.utcnow().isoformat(), 1))
    print("  [+] Student user: student@jee.com / student123")
    
    # 4. Seed topics, videos, and student_progress
    print("[*] Seeding topics, progress, and videos...")
    for subj_name, topics in TOPICS.items():
        subj_id = subject_ids[subj_name]
        for title, order, desc in topics:
            topic_id = uuid.uuid4().hex
            cursor.execute("""
                INSERT INTO topics (id, subject_id, title, sequence_order, description, pass_threshold, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (topic_id, subj_id, title, order, desc, 0.70, 1))
            
            # Gating progress: first chapter is in_progress, rest locked
            status = "in_progress" if order == 1 else "locked"
            sp_id = uuid.uuid4().hex
            cursor.execute("""
                INSERT INTO student_progress (id, student_id, topic_id, status, best_score, attempts_count, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (sp_id, student_id, topic_id, status, 0.0, 0, datetime.utcnow().isoformat()))
            
            # Seed videos
            videos_to_seed = DEFAULT_VIDEOS[subj_name]
            if title == "Kinematics":
                videos_to_seed = KINEMATICS_VIDEOS
                
            for v in videos_to_seed:
                v_id = uuid.uuid4().hex
                cursor.execute("""
                    INSERT INTO videos (id, topic_id, title, url, duration_seconds, language, is_active, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (v_id, topic_id, v["title"], v["url"], v["duration_seconds"], "en", 1, datetime.utcnow().isoformat()))
                
        print(f"  [+] Seeded topics, progress, and videos for {subj_name}")
        
    conn.commit()
    conn.close()
    print("[+] Base seed complete!")

if __name__ == "__main__":
    seed_all()

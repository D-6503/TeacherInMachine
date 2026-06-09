#!/usr/bin/env python3
"""
PDF ingestion pipeline: PDF files → text chunks → embeddings → Qdrant vector store.

Usage:
    python ingest_pdfs.py --dir /path/to/pdfs --topic-id <uuid>
    python ingest_pdfs.py --file /path/to/file.pdf --topic-id <uuid> --topic-title "Units and Measurements"
"""
import argparse
import asyncio
import os
import sys
import uuid
import hashlib
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk.strip():
            chunks.append(chunk.strip())
        i += chunk_size - overlap
    return chunks


def extract_pdf_text(pdf_path: str) -> str:
    """Extract text from PDF using PyMuPDF."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        text_parts = []
        for page in doc:
            text_parts.append(page.get_text())
        doc.close()
        return "\n\n".join(text_parts)
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""


def get_embedder():
    """Load sentence transformer model."""
    from sentence_transformers import SentenceTransformer
    print("Loading embedding model BAAI/bge-large-en-v1.5...")
    model = SentenceTransformer("BAAI/bge-large-en-v1.5")
    print("Model loaded.")
    return model


def get_qdrant_client():
    """Get Qdrant client."""
    from qdrant_client import QdrantClient
    from app.config import settings
    return QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)


def ensure_collection(client, collection_name: str = "jee_content", vector_size: int = 1024):
    """Create Qdrant collection if it doesn't exist."""
    from qdrant_client.http.models import Distance, VectorParams
    existing = [c.name for c in client.get_collections().collections]
    if collection_name not in existing:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )
        print(f"Created Qdrant collection: {collection_name}")
    else:
        print(f"Collection '{collection_name}' already exists.")


def ingest_pdf(
    pdf_path: str,
    topic_id: str,
    topic_title: str,
    subject: str = "unknown",
    collection_name: str = "jee_content",
    chunk_size: int = 500,
    overlap: int = 50,
):
    """Full pipeline: PDF → chunks → embeddings → Qdrant."""
    from qdrant_client.http.models import PointStruct

    print(f"\nProcessing: {pdf_path}")
    text = extract_pdf_text(pdf_path)
    if not text.strip():
        print("  No text extracted, skipping.")
        return 0

    print(f"  Extracted {len(text)} characters")
    chunks = chunk_text(text, chunk_size=chunk_size, overlap=overlap)
    print(f"  Split into {len(chunks)} chunks")

    embedder = get_embedder()
    client = get_qdrant_client()
    ensure_collection(client, collection_name)

    embeddings = embedder.encode(chunks, show_progress_bar=True, batch_size=32)
    points = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        chunk_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{topic_id}-{i}-{hashlib.md5(chunk.encode()).hexdigest()}"))
        points.append(
            PointStruct(
                id=chunk_id,
                vector=embedding.tolist(),
                payload={
                    "text": chunk,
                    "topic_id": topic_id,
                    "topic_title": topic_title,
                    "subject": subject,
                    "chunk_index": i,
                    "source_file": os.path.basename(pdf_path),
                },
            )
        )

    # Batch upsert
    batch_size = 100
    for i in range(0, len(points), batch_size):
        client.upsert(collection_name=collection_name, points=points[i : i + batch_size])
    print(f"  ✅ Ingested {len(points)} chunks into Qdrant collection '{collection_name}'")
    return len(points)


def main():
    parser = argparse.ArgumentParser(description="Ingest PDFs into Qdrant vector store")
    parser.add_argument("--file", type=str, help="Path to single PDF file")
    parser.add_argument("--dir", type=str, help="Directory containing PDF files")
    parser.add_argument("--topic-id", type=str, required=True, help="Topic UUID")
    parser.add_argument("--topic-title", type=str, default="", help="Topic title")
    parser.add_argument("--subject", type=str, default="unknown", help="Subject name")
    parser.add_argument("--collection", type=str, default="jee_content", help="Qdrant collection name")
    parser.add_argument("--chunk-size", type=int, default=500, help="Words per chunk")
    parser.add_argument("--overlap", type=int, default=50, help="Overlap words between chunks")
    args = parser.parse_args()

    total = 0
    if args.file:
        total += ingest_pdf(
            args.file, args.topic_id, args.topic_title,
            args.subject, args.collection, args.chunk_size, args.overlap
        )
    elif args.dir:
        pdf_files = list(Path(args.dir).glob("*.pdf"))
        if not pdf_files:
            print(f"No PDF files found in {args.dir}")
            return
        for pdf_path in pdf_files:
            total += ingest_pdf(
                str(pdf_path), args.topic_id, args.topic_title,
                args.subject, args.collection, args.chunk_size, args.overlap
            )
    else:
        print("Error: Provide --file or --dir")
        parser.print_help()
        return

    print(f"\n✅ Total chunks ingested: {total}")


if __name__ == "__main__":
    main()

import logging
import uuid
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

_qdrant = None
OLLAMA_EMBED_URL = f"{settings.OLLAMA_BASE_URL}/api/embeddings"
EMBED_MODEL = "nomic-embed-text:latest"

def _get_qdrant():
    global _qdrant
    if _qdrant is None:
        try:
            from qdrant_client import QdrantClient
            # Attempt to connect to external Qdrant
            client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT, timeout=3.0)
            # Test connectivity
            client.get_collections()
            _qdrant = client
            logger.info("Successfully connected to external Qdrant database.")
        except Exception as e:
            logger.warning(f"Could not connect to external Qdrant: {e}. Falling back to local file-based Qdrant.")
            try:
                from qdrant_client import QdrantClient
                import os
                # Store local database in the backend directory
                base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                db_path = os.path.join(base_dir, "qdrant_db")
                _qdrant = QdrantClient(path=db_path)
                logger.info(f"Successfully initialized local file-based Qdrant at: {db_path}")
            except Exception as e_inner:
                logger.error(f"Failed to initialize local file-based Qdrant: {e_inner}")
                _qdrant = None
    return _qdrant


def get_embedding_sync(text: str) -> list[float]:
    """Fetch embedding from Ollama nomic-embed-text model synchronously."""
    try:
        resp = httpx.post(
            OLLAMA_EMBED_URL,
            json={"model": EMBED_MODEL, "prompt": text},
            timeout=30.0
        )
        resp.raise_for_status()
        return resp.json().get("embedding", [])
    except Exception as e:
        logger.error(f"Failed to get embedding from Ollama: {e}")
        return []


async def get_embedding_async(text: str) -> list[float]:
    """Fetch embedding from Ollama nomic-embed-text model asynchronously."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                OLLAMA_EMBED_URL,
                json={"model": EMBED_MODEL, "prompt": text}
            )
            resp.raise_for_status()
            return resp.json().get("embedding", [])
    except Exception as e:
        logger.error(f"Failed to get embedding from Ollama async: {e}")
        return []


async def get_context(query: str, top_k: int = 5) -> str:
    """Retrieve RAG context for a search query."""
    try:
        qdrant = _get_qdrant()
        if qdrant is None:
            return ""
        
        embedding = await get_embedding_async(query)
        if not embedding:
            return ""
            
        results = qdrant.query_points(
            collection_name="jee_content",
            query=embedding,
            limit=top_k,
        )
        chunks = [r.payload.get("text", "") for r in results.points if r.payload]
        return "\n\n".join(chunks)
    except Exception as e:
        logger.warning(f"RAG context retrieval failed (graceful degradation): {e}")
        return ""


async def get_topic_context(query: str, topic_id: str, top_k: int = 5) -> str:
    """Retrieve RAG context restricted to a specific topic ID using Qdrant filters."""
    try:
        qdrant = _get_qdrant()
        if qdrant is None:
            return ""
            
        embedding = await get_embedding_async(query)
        if not embedding:
            return ""
            
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="topic_id",
                    match=MatchValue(value=topic_id)
                )
            ]
        )
        
        results = qdrant.query_points(
            collection_name="jee_content",
            query=embedding,
            query_filter=query_filter,
            limit=top_k,
        )
        chunks = [r.payload.get("text", "") for r in results.points if r.payload]
        return "\n\n".join(chunks)
    except Exception as e:
        logger.warning(f"RAG topic context retrieval failed: {e}")
        return ""


def index_pdf(topic_id: str, pdf_bytes: bytes) -> bool:
    """Extracts text from a PDF, chunks it, embeds it using Ollama, and indexes it in Qdrant."""
    try:
        import fitz  # PyMuPDF
        from qdrant_client.models import Distance, VectorParams, PointStruct

        qdrant = _get_qdrant()
        if qdrant is None:
            logger.warning("RAG indexing skipped: Qdrant client is not initialized.")
            return False

        # Ensure collection exists (nomic-embed-text size is 768)
        try:
            qdrant.get_collection("jee_content")
        except Exception:
            qdrant.create_collection(
                collection_name="jee_content",
                vectors_config=VectorParams(size=768, distance=Distance.COSINE),
            )
            logger.info("Created Qdrant collection 'jee_content' with vector size 768")

        # Extract text page by page
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_content = []
        for page in doc:
            text_content.append(page.get_text())
        full_text = "\n".join(text_content)
        doc.close()

        if not full_text.strip():
            logger.warning(f"RAG indexing skipped: No text extracted from PDF for topic {topic_id}")
            return False

        # Chunk text recursively by paragraph/sentences, falling back to 500 char blocks
        chunk_size = 500
        overlap = 100
        chunks = []
        start = 0
        while start < len(full_text):
            end = start + chunk_size
            chunks.append(full_text[start:end])
            start += chunk_size - overlap

        # Embed and upsert chunks
        points = []
        for idx, chunk in enumerate(chunks):
            if not chunk.strip():
                continue
            
            embedding = get_embedding_sync(chunk)
            if not embedding:
                continue
                
            # Generate deterministic UUID based on topic_id and chunk index
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{topic_id}_{idx}"))
            points.append(
                PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={"topic_id": topic_id, "text": chunk},
                )
            )

        if points:
            qdrant.upsert(
                collection_name="jee_content",
                wait=True,
                points=points,
            )
            logger.info(f"Successfully indexed {len(points)} chunks into Qdrant for topic {topic_id}")
            return True

        return False
    except Exception as e:
        logger.error(f"RAG PDF indexing failed: {e}")
        return False

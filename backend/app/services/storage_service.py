import boto3
import io
import logging
import os
from botocore.exceptions import ClientError
from app.config import settings

logger = logging.getLogger(__name__)
_s3_client = None
_use_local_storage = False

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIC_DIR = os.path.join(BASE_DIR, "static")



def get_client():
    global _s3_client, _use_local_storage
    if _use_local_storage:
        return None
    if _s3_client is None:
        try:
            _s3_client = boto3.client(
                "s3",
                endpoint_url=f"http{'s' if settings.MINIO_SECURE else ''}://{settings.MINIO_ENDPOINT}",
                aws_access_key_id=settings.MINIO_ACCESS_KEY,
                aws_secret_access_key=settings.MINIO_SECRET_KEY,
                config=boto3.session.Config(connect_timeout=3, read_timeout=3, retries={"max_attempts": 1})
            )
        except Exception as e:
            logger.warning(f"Could not connect to MinIO client, falling back to local storage: {e}")
            _use_local_storage = True
    return _s3_client


def ensure_bucket():
    global _use_local_storage
    if _use_local_storage:
        os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
        return

    client = get_client()
    if client is None:
        _use_local_storage = True
        os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
        return

    try:
        client.head_bucket(Bucket=settings.MINIO_BUCKET)
        logger.info(f"Successfully head bucket: {settings.MINIO_BUCKET}")
    except ClientError as e:
        # If bucket doesn't exist, try to create it
        error_code = e.response.get('Error', {}).get('Code')
        if error_code == '404' or 'Not Found' in str(e):
            try:
                client.create_bucket(Bucket=settings.MINIO_BUCKET)
                logger.info(f"Created MinIO bucket: {settings.MINIO_BUCKET}")
            except Exception as create_err:
                logger.warning(f"Failed to create bucket: {create_err}. Falling back to local storage.")
                _use_local_storage = True
                os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
        else:
            logger.warning(f"MinIO head bucket error: {e}. Falling back to local storage.")
            _use_local_storage = True
            os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
    except Exception as e:
        logger.warning(f"MinIO connection failed: {e}. Falling back to local storage.")
        _use_local_storage = True
        os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)


def upload_file(file_bytes: bytes, object_name: str, content_type: str = "application/octet-stream") -> str:
    global _use_local_storage
    if _use_local_storage:
        filepath = os.path.join(STATIC_DIR, "uploads", object_name)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(file_bytes)
        logger.info(f"Uploaded file locally to: {filepath}")
        return object_name

    try:
        client = get_client()
        if client is None:
            raise Exception("Client is None")
        client.upload_fileobj(
            io.BytesIO(file_bytes),
            settings.MINIO_BUCKET,
            object_name,
            ExtraArgs={"ContentType": content_type},
        )
        return object_name
    except Exception as e:
        logger.warning(f"MinIO upload failed: {e}. Retrying with local storage.")
        _use_local_storage = True
        # Recursive fallback
        return upload_file(file_bytes, object_name, content_type)


def get_presigned_url(object_name: str, expires: int = 3600) -> str:
    global _use_local_storage
    if _use_local_storage:
        # Clean target name for URL path
        safe_name = object_name.replace("\\", "/")
        return f"http://localhost:8000/static/uploads/{safe_name}"

    try:
        client = get_client()
        if client is None:
            raise Exception("Client is None")
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.MINIO_BUCKET, "Key": object_name},
            ExpiresIn=expires,
        )
    except Exception as e:
        logger.warning(f"MinIO presigned URL failed: {e}. Falling back to local storage URL.")
        # If bucket/connection fails during runtime, temporarily fall back
        safe_name = object_name.replace("\\", "/")
        return f"http://localhost:8000/static/uploads/{safe_name}"

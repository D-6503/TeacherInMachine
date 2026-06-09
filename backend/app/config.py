from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"
    OLLAMA_EVAL_MODEL: str = "qwen2.5:0.5b"
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_SECURE: bool = False
    MINIO_BUCKET: str = "jee-platform"
    JWT_SECRET: str = "changeme"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"
    WHISPER_MODEL_SIZE: str = "base"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()

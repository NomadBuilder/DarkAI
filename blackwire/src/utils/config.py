"""Configuration and settings utilities."""

import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration."""
    
    # Database
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_USER = os.getenv("POSTGRES_USER", "blackwire_user")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "blackwire123password")
    POSTGRES_DB = os.getenv("POSTGRES_DB", "blackwire")
    
    NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    # Support both NEO4J_USER and NEO4J_USERNAME (Neo4j Aura uses USERNAME)
    NEO4J_USER = os.getenv("NEO4J_USERNAME") or os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "blackwire123password")
    
    # Flask
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "1") == "1"
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    
    # API Keys (must be set in .env file)
    IPAPI_KEY = os.getenv("IPAPI_KEY", "")
    VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")
    NUMLOOKUP_API_KEY = os.getenv("NUMLOOKUP_API_KEY", "")
    ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY", "")
    
    # Rate Limiting
    ENRICHMENT_RATE_LIMIT = int(os.getenv("ENRICHMENT_RATE_LIMIT", "10"))  # per minute
    
    # Caching
    CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() == "true"
    CACHE_TTL_HOURS = int(os.getenv("CACHE_TTL_HOURS", "24"))
    
    # Request Timeouts
    API_TIMEOUT_SECONDS = int(os.getenv("API_TIMEOUT_SECONDS", "10"))
    DB_CONNECTION_TIMEOUT = int(os.getenv("DB_CONNECTION_TIMEOUT", "5"))
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE", "logs/blackwire.log")
    
    # Retry Configuration
    MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
    RETRY_BASE_DELAY = float(os.getenv("RETRY_BASE_DELAY", "1.0"))
    
    @classmethod
    def get_database_url(cls) -> str:
        """Get PostgreSQL connection URL."""
        return f"postgresql://{cls.POSTGRES_USER}:{cls.POSTGRES_PASSWORD}@{cls.POSTGRES_HOST}:{cls.POSTGRES_PORT}/{cls.POSTGRES_DB}"
    
    @classmethod
    def is_production(cls) -> bool:
        """Check if running in production."""
        return cls.FLASK_ENV.lower() == "production"


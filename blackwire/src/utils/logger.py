"""Logging configuration for BlackWire."""

import os
import logging
import sys
from typing import Optional
from logging.handlers import RotatingFileHandler
from pathlib import Path

# Create logs directory if it doesn't exist
LOG_DIR = Path(__file__).parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)


def setup_logger(name: str = "blackwire", level: Optional[str] = None) -> logging.Logger:
    """
    Setup logger with file and console handlers.
    
    Args:
        name: Logger name
        level: Log level (DEBUG, INFO, WARNING, ERROR)
    
    Returns:
        Configured logger
    """
    logger = logging.getLogger(name)
    
    # Set log level
    if level:
        logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    else:
        env_level = os.getenv("LOG_LEVEL", "INFO")
        logger.setLevel(getattr(logging, env_level.upper(), logging.INFO))
    
    # Don't add handlers if they already exist
    if logger.handlers:
        return logger
    
    # Create formatters
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    console_formatter = logging.Formatter(
        '%(levelname)s - %(message)s'
    )
    
    # File handler (rotating, 10MB max, keep 5 backups)
    file_handler = RotatingFileHandler(
        LOG_DIR / "blackwire.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    return logger


# Create default logger
logger = setup_logger()


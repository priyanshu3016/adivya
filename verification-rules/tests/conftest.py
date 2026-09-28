"""
Pytest configuration and fixtures for verification-rules tests.
Sets up sys.path to enable importing subpackages and reusing document_ai normalizers.
"""
import os
import sys
from pathlib import Path

# Paths to relevant directories
TESTS_DIR = Path(__file__).resolve().parent
VERIFICATION_RULES_DIR = TESTS_DIR.parent
PROJECT_ROOT = VERIFICATION_RULES_DIR.parent
DOCUMENT_AI_DIR = PROJECT_ROOT / "document-ai"
BACKEND_DIR = PROJECT_ROOT / "backend"

# Ensure directories are in sys.path
for path_dir in [str(VERIFICATION_RULES_DIR), str(DOCUMENT_AI_DIR), str(BACKEND_DIR)]:
    if path_dir not in sys.path:
        sys.path.insert(0, path_dir)

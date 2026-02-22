#!/usr/bin/env python3
"""
Discover all project documentation files in a given directory.
Outputs a JSON list of found documentation file paths.

Usage:
    python find_docs.py [project_root]

If project_root is not provided, uses the current working directory.
"""

import json
import os
import sys
from pathlib import Path

# Documentation file patterns
DOC_EXTENSIONS = {".md", ".mdx", ".pm", ".rule", ".mdc"}

# Known documentation filenames (case-insensitive matching)
KNOWN_DOC_FILES = {
    "claude.md",
    "readme.md",
    "contributing.md",
    "changelog.md",
    "architecture.md",
    ".cursorrules",
    ".clinerules",
    ".roomodes",
}

# Directories likely to contain documentation
DOC_DIRS = {"docs", "doc", "documentation", ".github", ".cursor"}

# Directories to skip
SKIP_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".next",
    ".nuxt",
    "__pycache__",
    ".venv",
    "venv",
    "vendor",
    ".turbo",
    ".cache",
}


def find_docs(root: str) -> list[dict[str, str]]:
    """Find all documentation files in the project."""
    root_path = Path(root).resolve()
    results: list[dict[str, str]] = []

    for dirpath_str, dirnames, filenames in os.walk(root_path):
        dirpath = Path(dirpath_str)

        # Skip excluded directories
        dirnames[:] = [
            d for d in dirnames
            if d not in SKIP_DIRS and not d.startswith(".")
            or d in DOC_DIRS
            or d == ".github"
            or d == ".cursor"
        ]

        rel_dir = dirpath.relative_to(root_path)

        for filename in filenames:
            filepath = dirpath / filename
            rel_path = str(filepath.relative_to(root_path)).replace("\\", "/")
            ext = filepath.suffix.lower()
            name_lower = filename.lower()

            is_doc = False
            reason = ""

            # Check by known filename
            if name_lower in KNOWN_DOC_FILES:
                is_doc = True
                reason = "known_doc_file"
            # Check by extension in doc directories
            elif ext in DOC_EXTENSIONS:
                is_doc = True
                if any(part in DOC_DIRS for part in rel_dir.parts):
                    reason = "doc_directory"
                else:
                    reason = "doc_extension"
            # Check for rule files in known locations
            elif name_lower.endswith(".mdc") or name_lower.endswith(".rule"):
                is_doc = True
                reason = "rule_file"

            if is_doc:
                results.append({
                    "path": rel_path,
                    "reason": reason,
                    "size": filepath.stat().st_size,
                })

    # Sort by path for consistent output
    results.sort(key=lambda x: x["path"])
    return results


def main() -> None:
    root = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()

    if not os.path.isdir(root):
        print(json.dumps({"error": f"Not a directory: {root}"}))
        sys.exit(1)

    docs = find_docs(root)

    output = {
        "project_root": str(Path(root).resolve()),
        "total_docs": len(docs),
        "files": docs,
    }

    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

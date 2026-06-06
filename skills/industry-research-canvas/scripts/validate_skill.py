#!/usr/bin/env python3
"""Validate the industry-research-canvas skill structure."""
from __future__ import annotations

import re
import sys
from pathlib import Path

NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

REQUIRED_FILES = [
    "SKILL.md",
    "agents/openai.yaml",
    "references/deep-research-workflow.md",
    "references/evidence-ladder.md",
    "references/market-source-playbook.md",
    "references/risk-and-compliance.md",
    "references/output-style-and-language.md",
    "references/data-source-urls.md",
    "assets/bottleneck-scorecard.json",
    "assets/thesis-template.md",
    "assets/canvas-patch-template.json",
    "assets/research-prompt-pack.md",
    "examples/a-share-ai-semiconductor-canvas.md",
    "examples/robotics-chain-canvas.md",
    "examples/company-challenge-canvas.md",
    "evals/test-cases.md",
]


def parse_frontmatter(text: str) -> dict[str, str]:
    if not text.startswith("---\n"):
        raise ValueError("SKILL.md must start with YAML frontmatter")
    end = text.find("\n---", 4)
    if end == -1:
        raise ValueError("SKILL.md frontmatter closing delimiter missing")
    data: dict[str, str] = {}
    for line in text[4:end].strip().splitlines():
        if not line.strip() or line.startswith(" "):
            continue
        if ":" in line:
            key, value = line.split(":", 1)
            data[key.strip()] = value.strip().strip('"')
    return data


def main() -> None:
    root = (Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()).resolve()
    skill_file = root / "SKILL.md"
    errors: list[str] = []

    if not skill_file.exists():
        errors.append("Missing SKILL.md")
    else:
        try:
            data = parse_frontmatter(skill_file.read_text(encoding="utf-8"))
            name = data.get("name", "")
            description = data.get("description", "")
            if not name:
                errors.append("name is required")
            elif not NAME_RE.match(name):
                errors.append("name must use lowercase letters, numbers, and hyphens")
            if root.name != name:
                errors.append(f"folder name '{root.name}' must match skill name '{name}'")
            if not description:
                errors.append("description is required")
            elif len(description) > 1024:
                errors.append(f"description exceeds 1024 characters: {len(description)}")
        except Exception as exc:
            errors.append(str(exc))

    for rel in REQUIRED_FILES:
        if not (root / rel).exists():
            errors.append(f"missing required file: {rel}")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        raise SystemExit(1)
    print(f"OK: {root.name} ({len(REQUIRED_FILES)} required resources)")


if __name__ == "__main__":
    main()

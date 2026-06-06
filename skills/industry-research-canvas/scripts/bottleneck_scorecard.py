#!/usr/bin/env python3
"""Score an industry bottleneck or company candidate for canvas research."""
from __future__ import annotations

import argparse
import json
import sys
from typing import Any

WEIGHTS = {
    "demand_pressure": 15,
    "bottleneck_severity": 20,
    "supplier_concentration": 10,
    "expansion_difficulty": 15,
    "company_closeness": 15,
    "evidence_quality": 10,
    "financial_quality": 10,
    "timing_visibility": 5,
}

PENALTY_MULTIPLIER = 2.0


def load(path: str) -> dict[str, Any]:
    raw = sys.stdin.read() if path == "-" else open(path, encoding="utf-8").read()
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise SystemExit("Input must be a JSON object")
    return data


def rating(value: Any, label: str) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        raise SystemExit(f"{label} must be a number from 0 to 5")
    if number < 0 or number > 5:
        raise SystemExit(f"{label} must be from 0 to 5")
    return number


def score(data: dict[str, Any]) -> dict[str, Any]:
    factors = data.get("factors", {})
    penalties = data.get("penalties", {})
    raw = 0.0
    details = {}
    for key, weight in WEIGHTS.items():
        r = rating(factors.get(key, 0), f"factors.{key}")
        points = r / 5 * weight
        details[key] = {"rating": r, "weight": weight, "points": round(points, 2)}
        raw += points

    penalty_points = 0.0
    penalty_details = {}
    for key, value in penalties.items():
        r = rating(value, f"penalties.{key}")
        points = r * PENALTY_MULTIPLIER
        penalty_details[key] = {"rating": r, "points": round(points, 2)}
        penalty_points += points

    final = max(0.0, min(100.0, raw - penalty_points))
    if final >= 85:
        verdict = "Top research priority"
    elif final >= 75:
        verdict = "Strong candidate"
    elif final >= 65:
        verdict = "Watchlist or secondary layer"
    else:
        verdict = "Adjacent exposure or weak proof"

    return {
        "topic": data.get("topic", ""),
        "market": data.get("market", ""),
        "raw_factor_points": round(raw, 2),
        "penalty_points": round(penalty_points, 2),
        "final_score": round(final, 2),
        "verdict": verdict,
        "factor_details": details,
        "penalty_details": penalty_details,
        "evidence": data.get("evidence", []),
        "what_could_weaken_view": data.get("what_could_weaken_view", []),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("--format", choices=["json", "md"], default="json")
    args = parser.parse_args()
    result = score(load(args.input))
    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    print(f"# Bottleneck scorecard: {result['topic'] or 'Untitled'}")
    print()
    print(f"Market: {result['market']}")
    print(f"Final score: **{result['final_score']} / 100**")
    print(f"Verdict: **{result['verdict']}**")


if __name__ == "__main__":
    main()

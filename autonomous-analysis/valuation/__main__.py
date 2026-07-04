"""CLI: read inputs JSON, print the valuation as Markdown (or JSON).

    python -m valuation --input input.json
    python -m valuation --input input.json --json --out valuation.md

Run from the autonomous-analysis/ directory (parent of the valuation/ package).
"""
from __future__ import annotations

import argparse
import json
import sys

from . import engine, render


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="valuation", description="M1 deterministic valuation engine")
    p.add_argument("--input", "-i", required=True, help="path to inputs JSON")
    p.add_argument("--json", action="store_true", help="emit raw structured results as JSON")
    p.add_argument("--out", "-o", help="write output to a file instead of stdout")
    args = p.parse_args(argv)

    with open(args.input, encoding="utf-8") as fh:
        inputs = json.load(fh)

    result = engine.analyze(inputs)
    text = json.dumps(result, indent=2, ensure_ascii=False) if args.json else render.to_markdown(result)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(text)
        print(f"wrote {args.out}", file=sys.stderr)
    else:
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

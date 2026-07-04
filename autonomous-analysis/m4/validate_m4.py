"""Deterministic structural check of the M4 output (pipeline + synthesis).

No model, no network. It checks:
  - DRAFT_SCHEMA (the synthesis contract = M2's input): verdict_card enums + thesis,
    draft_markdown has the 10 numbered field headings (## 1. .. ## 10.).
  - the full M4 return: all top-level keys; valuation non-empty; the draft
    passes DRAFT_SCHEMA; the m2 block passes validate_m2.check; the report and
    final card are present and correct.
  - artifact_paths(): deterministic paths of the 3 artifacts.

Usage:
    python validate_m4.py <m4_output.json>

FAIL details are printed via repr() (ascii-safe on the console).
Exit 0 = PASS, 1 = there are FAILs.
"""
import json
import os
import re
import sys

# reuse the green M2 check (sibling module in ../m2)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "m2"))
import validate_m2  # noqa: E402

VERDICT = {"BUY", "WAIT", "PASS"}
CONVICTION = {"high", "medium", "low"}

RETURN_KEYS = [
    "ticker", "as_of", "regime", "source_sufficiency", "datapack_markdown",
    "m1_input", "valuation", "streams", "pillars", "draft_markdown",
    "verdict_card", "m2", "final_report_markdown", "final_verdict_card",
    "drivers",  # the canonical driver list from the revision - the main thread builds the card frontmatter from it
]


def _has_text(s):
    return isinstance(s, str) and s.strip() != ""


def _numbered_headings(md):
    """draft_markdown must have headings ## 1. .. ## 10. (the 10 doctrine fields).

    Detection by number (## N.) - robust to the title wording.
    The pattern '%d\\.' does not confuse 1 with 10 (after '1' in '10' comes '0', not '.').
    """
    if not isinstance(md, str):
        return [False] * 10
    return [bool(re.search(r"(?m)^\s*#{1,6}\s*%d\." % n, md)) for n in range(1, 11)]


def _corpus_sections(md):
    """final_report_markdown must be a FULL 8-pillar report (not just the card).

    Checks for the headings: Step 0, Pillar 1..8, Final verdict.
    Detection is case-insensitive.
    Returns a list of (label, ok).
    """
    if not isinstance(md, str):
        md = ""
    out = [("step_0", bool(re.search(r"(?im)^\s*#{1,6}\s*Step\s*0\b", md)))]
    for n in range(1, 9):
        out.append(("pillar_%d" % n, bool(re.search(r"(?im)^\s*#{1,6}\s*Pillar\s*%d\b" % n, md))))
    out.append(("final_verdict", bool(re.search(r"(?im)^\s*#{1,6}\s*Final\s+verdict", md))))
    return out


def check_draft(draft_markdown, verdict_card):
    """Returns (rows, fails) for the DRAFT_SCHEMA contract (synthesis)."""
    rows = []
    fails = 0

    def row(label, ok, detail=""):
        nonlocal fails
        rows.append((label, "ok" if ok else "FAIL %s" % detail))
        if not ok:
            fails += 1
        return ok

    vc = verdict_card if isinstance(verdict_card, dict) else {}
    row("draft.verdict_card.is_dict", isinstance(verdict_card, dict), "not-a-dict")
    row("draft.thesis", _has_text(vc.get("thesis")), "empty")
    row("draft.verdict", vc.get("verdict") in VERDICT, repr(vc.get("verdict")))
    row("draft.conviction", vc.get("conviction") in CONVICTION, repr(vc.get("conviction")))
    row("draft.markdown.nonempty", _has_text(draft_markdown), "empty")
    for i, ok in enumerate(_numbered_headings(draft_markdown), start=1):
        row("draft.field_%d_heading" % i, ok, "no ## %d." % i)
    return rows, fails


def check_return(result):
    """Returns (rows, fails) for the full M4 return."""
    rows = []
    fails = 0

    def row(label, ok, detail=""):
        nonlocal fails
        rows.append((label, "ok" if ok else "FAIL %s" % detail))
        if not ok:
            fails += 1
        return ok

    if not isinstance(result, dict):
        return [("result", "FAIL not-a-dict")], 1

    for k in RETURN_KEYS:
        row("top.%s" % k, k in result, "MISSING")

    val = result.get("valuation")
    row("valuation.nonempty", isinstance(val, dict) and len(val) > 0, "empty/not-dict")

    # DRAFT_SCHEMA on draft + verdict_card
    d_rows, d_fails = check_draft(result.get("draft_markdown"), result.get("verdict_card"))
    rows.extend(d_rows)
    fails += d_fails

    # m2 block -> reuse validate_m2.check (the M2 contract must be green)
    m2 = result.get("m2")
    if isinstance(m2, dict):
        _m2_rows, m2_fails = validate_m2.check(m2)
        row("m2.validate_m2", m2_fails == 0, "%d M2 subchecks FAIL" % m2_fails)
    else:
        row("m2.validate_m2", False, "no-m2-block")

    final_report = result.get("final_report_markdown")
    row("final_report_markdown.nonempty", _has_text(final_report), "empty")
    # the final report MUST be a full 8-pillar corpus (decision A), not just the verdict card
    for label, ok in _corpus_sections(final_report):
        row("final_report.%s" % label, ok, "no heading")

    fvc = result.get("final_verdict_card")
    fvc = fvc if isinstance(fvc, dict) else {}
    row("final.verdict", fvc.get("verdict") in VERDICT, repr(fvc.get("verdict")))
    row("final.conviction", fvc.get("conviction") in CONVICTION, repr(fvc.get("conviction")))
    row("final.thesis", _has_text(fvc.get("thesis")), "empty")

    return rows, fails


def artifact_paths(ticker, as_of):
    """Deterministic paths of the 3 artifacts (relative to the research vault root).

    Convention: _sources/<date>-autonomous-data-pack.md, <date>-autonomous-full-analysis.md,
    _<TICKER>.md. Date = as_of (the sandbox has no Date; the main thread injects as_of/currentDate).
    """
    base = "analyses/%s" % ticker
    return {
        "data_pack": "%s/_sources/%s-autonomous-data-pack.md" % (base, as_of),
        "full_analysis": "%s/%s-autonomous-full-analysis.md" % (base, as_of),
        "verdict_card": "%s/_%s.md" % (base, ticker),
    }


def _print(rows, fails, title):
    width = max(len(r[0]) for r in rows)
    print("=== %s ===" % title)
    print("%-*s  %s" % (width, "check", "status"))
    print("-" * (width + 30))
    for label, status in rows:
        mark = "" if status == "ok" else "  <<<"
        print("%-*s  %s%s" % (width, label, status, mark))
    total = len(rows)
    print("-" * (width + 30))
    print("PASS" if fails == 0 else "FAIL", "- %d/%d checks ok, %d FAIL" % (total - fails, total, fails))


def main():
    if len(sys.argv) < 2:
        print("usage: python validate_m4.py <m4_output.json>")
        sys.exit(2)
    with open(sys.argv[1], encoding="utf-8") as f:
        result = json.load(f)
    rows, fails = check_return(result)
    _print(rows, fails, "M4 return - structural check")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()

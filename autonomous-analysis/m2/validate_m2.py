"""Deterministic structural check of the M2 output (adversarial pass).

No model, no network. It checks the M2 bundle CONTRACT (not the quality of the
attacks - that is soft, on a fixture, in the must-catch section of the README).
Rules: top-level keys, non-empty findings with 7 fields, bull/bear symmetry
consistent with the flag, gate_audit for gate_1..gate_5 with a pass|fail verdict,
stopped_reason in {dry,cap}, rounds_run 1..3, unresolved consistent with status.

Usage:
    python validate_m2.py <m2_output.json>

ASCII output (console-safe). Exit 0 = PASS, 1 = there are FAILs.
"""
import json
import sys

TOP_KEYS = [
    "ticker", "as_of", "rounds_run", "stopped_reason",
    "findings", "gate_audit", "symmetry_ok", "unresolved",
]
FINDING_FIELDS = [
    "side", "severity", "claim", "evidence_or_gap",
    "recommended_fix", "status", "verdict_impact",
]
SEVERITY = {"high", "med", "low"}
STATUS = {"resolved", "unresolved"}
GATES = ["gate_1", "gate_2", "gate_3", "gate_4", "gate_5"]
STOP = {"dry", "cap"}


def check(bundle):
    """Returns (rows, fails). rows = list of (label, status_str)."""
    rows = []
    fails = 0

    def row(label, ok, detail=""):
        nonlocal fails
        rows.append((label, "ok" if ok else "FAIL %s" % detail))
        if not ok:
            fails += 1
        return ok

    if not isinstance(bundle, dict):
        return [("bundle", "FAIL not-a-dict")], 1

    for k in TOP_KEYS:
        row("top.%s" % k, k in bundle, "MISSING")

    findings = bundle.get("findings")
    findings = findings if isinstance(findings, list) else []
    row("findings.nonempty", len(findings) > 0, "empty")
    for i, f in enumerate(findings):
        f = f if isinstance(f, dict) else {}
        miss = [x for x in FINDING_FIELDS if x not in f]
        row("findings[%d].fields" % i, not miss, "missing %s" % miss)
        if "severity" in f:
            row("findings[%d].severity" % i, f["severity"] in SEVERITY, str(f.get("severity")))
        if "status" in f:
            row("findings[%d].status" % i, f["status"] in STATUS, str(f.get("status")))
        if "verdict_impact" in f:
            row("findings[%d].verdict_impact" % i, isinstance(f["verdict_impact"], bool), "not-bool")

    sides = {f.get("side") for f in findings if isinstance(f, dict)}
    has_bull = "bull" in sides
    has_bear = "bear" in sides
    row("symmetry.has_bull", has_bull, "no bull finding")
    row("symmetry.has_bear", has_bear, "no bear finding")
    row("symmetry_ok.consistent",
        bundle.get("symmetry_ok") == (has_bull and has_bear),
        "flag %s vs actual %s" % (bundle.get("symmetry_ok"), has_bull and has_bear))

    ga = bundle.get("gate_audit")
    ga = ga if isinstance(ga, dict) else {}
    for g in GATES:
        entry = ga.get(g)
        ok = isinstance(entry, dict) and entry.get("verdict") in {"pass", "fail"}
        row("gate_audit.%s" % g, ok, "missing/bad verdict")

    row("stopped_reason", bundle.get("stopped_reason") in STOP, str(bundle.get("stopped_reason")))

    rr = bundle.get("rounds_run")
    row("rounds_run", isinstance(rr, int) and 1 <= rr <= 3, str(rr))

    unresolved = bundle.get("unresolved")
    unresolved = unresolved if isinstance(unresolved, list) else []
    bad = [u for u in unresolved if not (isinstance(u, dict) and u.get("status") == "unresolved")]
    row("unresolved.consistent", not bad, "%d entries != unresolved" % len(bad))

    return rows, fails


def main():
    if len(sys.argv) < 2:
        print("usage: python validate_m2.py <m2_output.json>")
        sys.exit(2)
    with open(sys.argv[1], encoding="utf-8") as f:
        bundle = json.load(f)
    rows, fails = check(bundle)
    width = max(len(r[0]) for r in rows)
    print("=== M2 output - structural check ===")
    print("%-*s  %s" % (width, "check", "status"))
    print("-" * (width + 30))
    for label, status in rows:
        mark = "" if status == "ok" else "  <<<"
        print("%-*s  %s%s" % (width, label, status, mark))
    total = len(rows)
    print("-" * (width + 30))
    print("PASS" if fails == 0 else "FAIL", "- %d/%d checks ok, %d FAIL" % (total - fails, total, fails))
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()

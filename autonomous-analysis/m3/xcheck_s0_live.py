"""Deterministic LIVE cross-check: datapack_json (S0) vs a fundamentals REST provider.

Closes the GIGO loop: it compares the FACTUAL fields of a fresh S0 against an
independent source (fiscal.ai REST /v1, auth via the apiKey= query param). No model
- pure network + arithmetic. Stdlib only.

Two classes of field:
- HARD (shares_diluted, ttm_revenue, ebitda_ttm, base_fcf_ttm, net_debt):
  out of tolerance = FAIL (hallucination/wrong unit/wrong company).
- MARKET (price, market_cap, enterprise_value): as_of vs live drift = WARN;
  FAIL only above 25% (a scale error, not drift).
A metric missing on the provider side (different templates/companies) = SKIP, not FAIL.
Forward consensus is NOT covered (REST does not expose estimates) - an explicit gap.

Usage:
    python xcheck_s0_live.py <input.json> [--company-key <EXCHANGE_TICKER>]

Input: a full M4 return (key m1_input), an S0 object (key datapack_json), or
datapack_json itself. API key: the env var FISCAL_AI_API_KEY or a .env at the repo root.
ASCII output (console-safe).
Exit: 0 = PASS/WARN, 1 = FAIL, 2 = SKIP (infra: no key/network/company).
The last STDOUT line is always: "XCHECK: PASS|WARN|FAIL|SKIP - <summary>".
"""
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
# m3 -> autonomous-analysis (repo root); look for a .env there
REPO_ENV = os.path.join(HERE, "..", ".env")
BASE = "https://api.fiscal.ai"
EXCHANGES = ("NYSE", "NASDAQ")  # order tried when auto-resolving a companyKey

# datapack field -> (warn_tol, fail_tol); None = no threshold for that class
FIELDS = [
    ("price",            0.07, 0.25),
    ("market_cap",       0.08, 0.25),
    ("enterprise_value", 0.10, 0.25),
    ("shares_diluted",   None, 0.05),
    ("ttm_revenue",      None, 0.05),
    ("ebitda_ttm",       None, 0.15),
    ("base_fcf_ttm",     None, 0.15),
    ("net_debt",         None, 0.15),
]


# ---------------------------------------------------------------------------
# Pure logic (testable without network)
# ---------------------------------------------------------------------------
def to_mln(v):
    """Normalize a provider value to mln (the datapack is in mln per contract)."""
    if v is None:
        return None
    v = float(v)
    return v / 1e6 if abs(v) >= 1e7 else v


def rel_diff(got, ref):
    if ref == 0:
        return abs(got - ref)
    return abs(got - ref) / abs(ref)


def compare_rows(dp, fiscal):
    """dp = datapack_json; fiscal = dict field->value in mln (None = unavailable).
    Returns a list of (field, got, ref, diff_pct, status)."""
    rows = []
    for field, warn_tol, fail_tol in FIELDS:
        got = dp.get(field)
        ref = fiscal.get(field)
        if got is None:
            rows.append((field, "MISSING", ref, None, "FAIL"))
            continue
        if ref is None:
            rows.append((field, got, "unavailable", None, "SKIP"))
            continue
        d = rel_diff(float(got), float(ref))
        if d > fail_tol:
            status = "FAIL"
        elif warn_tol is not None and d > warn_tol:
            status = "WARN"
        else:
            status = "ok"
        rows.append((field, got, round(ref, 2), round(d * 100, 1), status))
    return rows


def verdict(rows):
    fails = sum(1 for r in rows if r[4] == "FAIL")
    warns = sum(1 for r in rows if r[4] == "WARN")
    skips = sum(1 for r in rows if r[4] == "SKIP")
    if fails:
        return "FAIL", "%d fields out of tolerance (%d WARN, %d SKIP)" % (fails, warns, skips)
    if warns:
        return "WARN", "%d fields with market drift (%d SKIP)" % (warns, skips)
    return "PASS", "all covered fields within tolerance (%d SKIP)" % skips


def find_metric(metrics_values, *patterns):
    """Find a metric value by a fragment of standardizedMetricId (the first pattern
    with a hit wins; within a pattern take the shortest id = the most canonical)."""
    for pat in patterns:
        hits = [k for k in metrics_values if re.search(pat, k)]
        if hits:
            key = min(hits, key=len)
            v = metrics_values[key]
            if isinstance(v, dict):
                v = v.get("value")
            return v
    return None


def latest_period(data, allowed_types=None):
    """The freshest period from data[] (max reportDate), optionally filtered by periodType."""
    rows = [d for d in (data or []) if not allowed_types or d.get("periodType") in allowed_types]
    if not rows:
        return None
    return max(rows, key=lambda d: d.get("reportDate") or "")


def fiscal_fields_from_payloads(ratios, income):
    """Assemble the comparison fields from the REST responses. The canonical source is
    the ready-made calculated_* from /v1/company/ratios?periodType=latest (the provider
    computes them; in testing they matched the datapack within ~1-3%). The LTM income
    statement adds revenue + diluted WASO. Missing field -> None (SKIP).
    Values normalized to mln."""
    out = {}

    rlat = latest_period((ratios or {}).get("data"))
    shares_total = None
    if rlat:
        mv = rlat.get("metricValues") or {}
        out["price"] = mv.get("market_data_share_price")
        out["market_cap"] = to_mln(mv.get("calculated_market_cap"))
        out["enterprise_value"] = to_mln(mv.get("calculated_tev"))
        out["net_debt"] = to_mln(mv.get("calculated_net_debt"))
        out["ebitda_ttm"] = to_mln(mv.get("calculated_ebitda"))
        out["base_fcf_ttm"] = to_mln(mv.get("calculated_fcf"))
        shares_total = to_mln(mv.get("market_data_total_shares_outstanding"))

    ilat = latest_period((income or {}).get("data"), {"LTM"})
    if ilat:
        mv = ilat.get("metricsValues") or {}
        out["ttm_revenue"] = to_mln(find_metric(mv, r"total_revenue"))
        waso = to_mln(find_metric(mv, r"diluted_weighted_average_shares"))
        out["shares_diluted"] = waso if waso is not None else shares_total
    elif shares_total is not None:
        out["shares_diluted"] = shares_total
    return out


# ---------------------------------------------------------------------------
# Network (fiscal.ai REST /v1, auth apiKey= query)
# ---------------------------------------------------------------------------
def api_key():
    key = os.environ.get("FISCAL_AI_API_KEY")
    if key:
        return key.strip()
    try:
        with open(REPO_ENV, encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("FISCAL_AI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"')
    except OSError:
        pass
    return None


def get_json(path, key, **params):
    params["apiKey"] = key
    url = "%s%s?%s" % (BASE, path, urllib.parse.urlencode(params))
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8.0"})
    with urllib.request.urlopen(req, timeout=45) as resp:
        return json.loads(resp.read().decode("utf-8"))


def try_get(path, key, **params):
    try:
        return get_json(path, key, **params)
    except (urllib.error.URLError, urllib.error.HTTPError, ValueError, OSError) as e:
        print("  [net] %s -> %s" % (path, e))
        return None


def resolve_company_key(ticker, key, explicit=None):
    if explicit:
        return explicit
    for ex in EXCHANGES:
        ck = "%s_%s" % (ex, ticker.upper())
        prof = try_get("/v2/company/profile", key, companyKey=ck)
        if prof and (prof.get("companyKey") or prof.get("ticker")):
            return ck
    return None


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    explicit_ck = None
    for i, a in enumerate(sys.argv[1:]):
        if a == "--company-key" and i + 2 <= len(sys.argv[1:]):
            explicit_ck = sys.argv[1:][i + 1]
    if not args:
        print("usage: python xcheck_s0_live.py <input.json> [--company-key <EXCHANGE_TICKER>]")
        sys.exit(2)
    with open(args[0], encoding="utf-8") as f:
        cand = json.load(f)
    dp = cand
    if isinstance(cand, dict):
        dp = cand.get("m1_input") or cand.get("datapack_json") or cand

    key = api_key()
    if not key:
        print("No FISCAL_AI_API_KEY (env / repo .env).")
        print("XCHECK: SKIP - no API key")
        sys.exit(2)

    ticker = dp.get("ticker", "")
    ck = resolve_company_key(ticker, key, explicit_ck)
    if not ck:
        print("Could not resolve a companyKey for '%s' (tried: %s)." % (ticker, ", ".join(EXCHANGES)))
        print("XCHECK: SKIP - company not resolved")
        sys.exit(2)
    print("=== xcheck S0 live: %s (%s) vs fiscal.ai REST ===" % (ticker, ck))

    ratios = try_get("/v1/company/ratios", key, companyKey=ck, periodType="latest")
    income = try_get("/v1/company/financials/income-statement/standardized", key, companyKey=ck, periodType="ltm", currency="USD")
    if not any([ratios, income]):
        print("No endpoint responded.")
        print("XCHECK: SKIP - network/API unavailable")
        sys.exit(2)

    fiscal = fiscal_fields_from_payloads(ratios or {}, income or {})
    rows = compare_rows(dp, fiscal)

    width = max(len(r[0]) for r in rows)
    print("%-*s  %-14s  %-14s  %-8s  %s" % (width, "field", "datapack", "fiscal.ai", "diff", "status"))
    print("-" * (width + 50))
    for field, got, ref, d, status in rows:
        mark = "" if status in ("ok", "SKIP") else "  <<<"
        dtxt = "-" if d is None else ("%.1f%%" % d)
        print("%-*s  %-14s  %-14s  %-8s  %s%s" % (width, field, str(got)[:14], str(ref)[:14], dtxt, status, mark))
    print("-" * (width + 50))
    print("Not covered (REST does not expose): consensus fcf/revenue/eps_adj, valuation_multiples.")
    v, note = verdict(rows)
    print("XCHECK: %s - %s" % (v, note))
    sys.exit(1 if v == "FAIL" else 0)


if __name__ == "__main__":
    main()

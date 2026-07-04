# M1 – Deterministic valuation engine

The M1 step of the `autonomous-analysis` tool. Pure Python (stdlib), no model, no
network. It reads a verified input pack (JSON) and returns a valuation read:
implied-vs-actual (reverse-DCF), a scenario fan with front/tail decomposition, a
scale sanity-check and cross-checks. The engine is **ticker-agnostic** – everything
that depends on the company lives in the input file.

Role in the doctrine: reverse-DCF reads **only** what the market prices in (the
implied-vs-actual gap); it does not produce a fair value to the dollar. Every figure
on a 5+ year horizon is marked `†` as a scenario artifact, not a measurement of the
future (the false-precision tax). See `DOCTRINE.md`.

## Run

From the `autonomous-analysis/` directory (the parent of the `valuation/` package):

```bash
# Markdown report (to paste into an analysis)
python -m valuation --input input.json

# write to a file
python -m valuation --input input.json --out valuation.md

# raw structured results (to feed the synthesis in the workflow)
python -m valuation --input input.json --json
```

## Files

| File | Role |
|---|---|
| `dcf.py` | pure math: reverse-DCF, solve implied growth (bisection), scenario→price, scale sanity, future-multiple+cash-bridge, PEG, FCF yield |
| `engine.py` | assembles the full read from one inputs dict (`analyze`) |
| `render.py` | results → English Markdown (no em-dash, the `†` flag, clean for a Google Docs export) |
| `preprofit.py` | pre-profit / Fermi math (M1b), used when the FCF base is non-positive |
| `__main__.py` | CLI (JSON/args → Markdown or JSON) |

## Input schema (short)

Key fields: `price`, `shares_diluted`, `net_debt`, `enterprise_value`, `market_cap`,
`base_fcf_ttm`, `ttm_revenue`, `wacc_anchor`, `wacc_sensitivity[]`, `terminal_growth`,
`explicit_years`, `fcf_margin`, `net_dilution`, `consensus{fcf,revenue,eps_adj,eps_cagr_3y}`,
`price_ladder[]`, `scenarios[]`, `front_tail_study`, `interconnect_market_size`,
`midcycle`, `future_multiple_check`.

A scenario takes one of three forms: `{"type":"flat","cagr":x}`,
`{"type":"front_tail","front":[5],"tail":[5]}`, `{"type":"path","fcf_growth":[10]}`.

## Known limitations (deliberate, M1)

- The mid-cycle haircut is taken as an input, not derived from margins (FCF is not
  linear in margin) – flagged (`midcycle.flag`).
- `interconnect_market_size` is a directional, unverified sector-TAM proxy – flagged
  (`est.`); it only drives the sanity flag, not the valuation. (The key name is
  historical; the engine reads it as a generic addressable-market size for any ticker.)

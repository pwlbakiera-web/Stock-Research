# autonomous-analysis

A self-contained, autonomous equity-research orchestrator. From a single **ticker** it
produces a full, analyst-grade investment report on its own: it gathers data, values the
company with a deterministic engine, writes a thesis, attacks that thesis adversarially, and
tempers it under fire — with no human in the loop.

The output is a full 8-pillar analysis plus a verdict card (**BUY / WAIT / PASS** + a
conviction and the reasoning), and a data pack with every number sourced or flagged.

> **This is a research artifact, not investment advice.** Every report is generated
> autonomously by LLMs; numbers can be wrong or stale and MUST be verified against primary
> sources (filings, IR, a fundamentals provider) before any decision. See the disclaimer below.

For a visual walkthrough open **`overview.html`** in a browser.

## The pipeline

Four modules, composed by `autonomous-analysis.mjs` (M4):

| Module | What it does | How |
|---|---|---|
| **M3** ingest | ticker → verified data pack + 6 parallel research streams (S0-S6) | LLM agents (S0=opus, S1-S6=sonnet) |
| **M1** valuation | reverse-DCF / pre-profit valuation: implied-vs-actual gap, scenario fan, scale sanity | pure Python, deterministic |
| **M2** adversarial | attacks the draft symmetrically (bull/bear) + audits 5 doctrine gates, loop-until-dry | 3 LLM roles x up to 3 rounds |
| **M4** assembly | 7 pillar-writers + synthesis + M2 + revision + a whole-report consistency editor | LLM agents + a pure-JS assembler |

The whole thing is governed by one decision doctrine — see **[`DOCTRINE.md`](DOCTRINE.md)**. The
core idea: find and test the **gap between the market's model and reality** (the edge), and
size the bet to the asymmetry, not to a made-up price target.

## What runs where (important)

- **The Python valuation engine and all validators are standalone** — plain Python 3.10+,
  stdlib only, no network. You can run them directly (see below).
- **The `.mjs` orchestrator scripts (M2, M3, M4) target an agentic Workflow runtime.** They are
  written for a sandboxed harness that provides the globals `agent()`, `workflow()`,
  `parallel()`, `phase()`, `log()` and `args`, with no filesystem/imports/`Date` at the top
  level. They are **not** runnable with plain `node` — they are the orchestration logic,
  published for reference and adaptation. Point `AA_DIR` (top of `autonomous-analysis.mjs`) at
  your clone and wire the scripts into your own agent runtime to execute them.

## Quickstart (the deterministic engine)

```bash
# a Markdown valuation report from your input pack
python -m valuation --input input.json

# raw structured results (JSON)
python -m valuation --input input.json --json
```

`input.json` is a verified data pack for one company; in the full pipeline the M3 ingest
step produces it automatically. To build one by hand, see the input schema in
[`valuation/README.md`](valuation/README.md) — it covers both valuation modes (reverse-DCF
for profitable companies, pre-profit/Fermi for not-yet-profitable ones).

## Research backends

The M3 research streams (S0–S6) and the pillar-writers reach the outside world through
whatever tools your agent runtime exposes. The private setup this was exported from wires
them to **local MCP servers**: a deep-research/search MCP as the primary web tool, plus
[jina](https://jina.ai) (page reads) and [serper](https://serper.dev) (search) as helpers,
and the [fiscal.ai](https://fiscal.ai) REST API to confirm the hard financials (the GIGO
cross-check below). Swap in your own equivalents — the scripts only assume an `agent()` that
can search and read the web, plus an optional fundamentals API for the cross-check.

## Optional: the live GIGO cross-check

`m3/xcheck_s0_live.py` deterministically cross-checks the data pack's hard fields against a
fundamentals REST provider (built for [fiscal.ai](https://fiscal.ai)). It needs your own API
key via the `FISCAL_AI_API_KEY` environment variable or a `.env` at the repo root. Without a
key it SKIPs (never fails the pipeline).

## Layout

```
autonomous-analysis.mjs   M4 orchestrator: the full pipeline + test-seam modes
DOCTRINE.md               the decision doctrine (source of truth for the verdict posture)
overview.html             a visual "how it works" walkthrough
m3/                       ingest: data pack (S0) + research streams (S1-S6) + live GIGO cross-check
m1 -> valuation/          deterministic valuation engine (M1)
m2/                       adversarial pass + structural validator
m4/                       return-contract validator
```

## Requirements

- Python 3.10+ (the engine and validators; standard library only).
- Node.js (only for a wrapper-aware syntax check of the `.mjs` files).
- An agentic Workflow runtime to actually execute the `.mjs` orchestrators (see above).
- Optional: a fundamentals-provider API key for the live cross-check.

## Disclaimer

This software generates investment analysis autonomously using large language models. It is
provided for research and educational purposes only. It is **not** financial advice, not a
recommendation to buy or sell any security, and not a substitute for professional judgment.
The outputs may contain factual errors, hallucinated numbers, or stale data. Do your own
research and verify every figure against primary sources. The authors accept no liability for
any use of this software or its outputs.

## License

MIT — see [`LICENSE`](LICENSE).

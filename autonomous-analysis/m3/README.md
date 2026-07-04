# M3 - the ingest layer (S0 + fan-out S1-S6)

The M3 step of the `autonomous-analysis` tool. Turns a bare ticker into a verified data
pack plus six research streams - the input for M1 (valuation), M2 (adversarial pass) and
synthesis.

Role in the doctrine: GIGO. Without a trusted data pack the rest of the pipeline computes
asymmetry on invented numbers. S0 acquires data from a **fundamentals provider as the
primary source** (e.g. fiscal.ai REST /v1, key from an env var / a repo-root `.env`), with
EDGAR / the open web as fallback; it does not fill gaps by inventing - it flags `est.` and
lowers conviction. After S0 the hard fields are deterministically cross-checked vs the
provider's REST (`xcheck_s0_live.py`, the GIGO gate).

## Files

| File | Role |
|---|---|
| `m3-ingest.mjs` | Self-contained Workflow script: S0 (opus) -> barrier -> S1-S6 (sonnet, parallel). Returns the ingest bundle. |
| `xcheck_s0_live.py` | Deterministic LIVE cross-check of `datapack_json` vs a fundamentals REST provider (hard fields = FAIL, market fields = WARN, missing metric = SKIP). Usage: `python m3/xcheck_s0_live.py <input.json> [--company-key <EXCHANGE_TICKER>]`; exit 0/1/2; last line `XCHECK: PASS\|WARN\|FAIL\|SKIP`. M4 runs it via a sonnet runner after ingest (FAIL aborts before the writers). |
| `README.md` | This file. |

## Stream map (one stream per pillar)

| Stream | Model | Pillars | Output |
|---|---|---|---|
| S0 data-pack / event-backbone | **opus** | Step 0 + Pillar 4 (trends) | data pack A-K + `datapack_json` (M1 inputs) + regime + source_sufficiency |
| S1 operational + technology | sonnet | Pillar 1 | business mechanics + technology for a layperson |
| S2 moat | sonnet | Pillar 2 | 5 sources, state + DIRECTION |
| S3 execution risk | sonnet | Pillar 3 | risks + `thesis_breakers` + `driver_tags` |
| S4 growth + lever bridge | sonnet | Pillar 5 + 5.5 | TAM, endo/exo levers, scenario CAGR seeds |
| S5 outlook + narrative | sonnet | Pillar 6 | outlook/guidance, market forecasts, bull/bear factors -> thesis_breakers + driver_tags; + 6 lenses x >=3 calls (narrative crux) |
| S6 sentiment / management | sonnet | Pillar 8 | sentiment, insider, short, management |

Models: data integrity + reasoning = opus; research = sonnet. M1 (valuation) = pure Python,
outside M3.

## I/O contracts

**S0 input:** `{ ticker, as_of }` (as_of via args - the Workflow sandbox has no `Date`).

**S0 output** (schema `S0_SCHEMA` in `m3-ingest.mjs`):
- `datapack_markdown` - the full pack A-K + Sources [S#] + Gaps -> a file for `analyses/[TICKER]/_sources/`.
- `datapack_json` - the inputs for M1 (schema `M1_INPUT_SCHEMA`).
- `regime` - `{ call, rationale }` (the Regime gate).
- `source_sufficiency` - `{ ok, have, missing, conviction_note }` (downgrade when data is thin).

**Stream input:** the data-pack markdown + a narrow brief (inline in `STREAMS`).
**Stream output** (schema `STREAM_SCHEMA`): `{ stream, summary, findings[], open_gaps[], driver_tags?[], thesis_breakers?[], cagr_seed?{bear,base,bull,flag} }` (`cagr_seed` is filled ONLY by S4 - FCF CAGR after research, fractions).

**Ingest bundle (M3 return):** `{ ticker, as_of, regime, source_sufficiency, datapack_markdown, datapack_json, streams{S1..S6} }`.

## The refinement seam (factual vs assumptions)

`datapack_json` has TWO layers:
- **Factual** (hard, sourced): `price, shares_diluted, net_debt, enterprise_value, market_cap, base_fcf_ttm, ttm_revenue, ebitda_ttm, consensus, valuation_multiples, fcf_margin`. This is the layer the live GIGO cross-check verifies.
- **Scenario assumptions** (analytical sediment): `scenarios, front_tail_study, midcycle.fcf_haircut, future_multiple_check, wacc_*, terminal_growth`. S0 emits these as **doctrine-default seeds** (so M1 runs immediately and the pipeline doesn't stall - the autonomy contract). Every 5y+ number is flagged as a scenario artifact.

Reason: S0 runs BEFORE S1-S6, so it does not yet have the S4 (TAM/levers) or S3 (risks) work that properly informs the scenarios. So M4 (the assembly) **overwrites** the seeds before valuation: `mergeS4CagrSeeds` deterministically folds `streams.S4.cagr_seed` into the `flat` scenarios (bear/base/bull, unambiguously matched by name; front_tail and supercycle keep the S0 shape; provenance in `cagr_s0`).

## Known coupling with M1

`engine.py` reads the key `interconnect_market_size` literally as the sector-TAM proxy - the
name is historical, but it works for any ticker. S0 MUST emit under this key. Renaming it
to `addressable_market_size` is a separate change in M1.

## S0 acceptance (GIGO gate)

After S0, run the live cross-check on the emitted `datapack_json`:

```bash
python m3/xcheck_s0_live.py <input.json> [--company-key <EXCHANGE_TICKER>]
```

The hard fields (price, EV, market cap, net debt, FCF, revenue, EBITDA, shares) are
compared against the fundamentals provider: out of tolerance on a hard field = FAIL
(hallucination / wrong unit / wrong company), market drift = WARN, a missing metric or no
API key = SKIP. FAIL aborts the run before the writers.

## What M3 deliberately does NOT do

- Does not compose the full workflow (`autonomous-analysis.mjs`) - that is M4.
- Does not contain M1 (valuation), M2 (adversarial pass) or synthesis.
- `m3-ingest.mjs` is runnable in isolation to test the ingest alone.
- M4 composes the ingest with the rest via `workflow({scriptPath: ".../m3/m3-ingest.mjs"})` as a sub-step (one level of nesting).

# M4 — pipeline assembly + 10-field synthesis

The M4 step of the `autonomous-analysis` tool. It composes M3 (ingest), M1 (valuation), the
pillar-writer layer (the 8-pillar corpus), the 10-field doctrine synthesis, M2 (adversarial
pass) and the revision into one orchestrator `autonomous-analysis.mjs`. From raw research ->
a FULL 8-pillar report (writer prose) + a verdict draft -> the M2 barrage -> closing sections
in which the thesis survived the attack -> a deterministic assembler.

## Corpus architecture (decision A — pillar-writers)

The output is a FULL 8-pillar analysis, not just the verdict card. The corpus is written by
**7 dedicated opus writers in parallel**; each gets the datapack + its stream(s) (+ valuation
where numeric) and writes the FULL PROSE of its section. The assembler (pure JS) stitches the
prose VERBATIM — no agent re-compresses the pillars (this kills the old failure mode: one agent
collapsing 8 pillars into a card). Budget per writer ~= one full pillar; pair only light+light /
thematically coupled.

| Writer | Section(s) | Input |
|---|---|---|
| W1 | Header + Methodological note + Step 0 | regime + datapack |
| W2 | Pillar 1 (Operational) | S1 + datapack |
| W3 | Pillar 2 (Moat) + Pillar 3 (Risk) | S2 + S3 + datapack |
| W4 | Pillar 4 (Financial) | datapack F + valuation |
| W5 | Pillar 5 (Growth) + 5.5 (Lever Bridge) | S4 + datapack + valuation |
| W6 | Pillar 6 (Outlook) | S5 + datapack |
| W7 | Pillar 7 (Valuation) + Pillar 8 (Sentiment) | S6 + datapack + valuation |

Driver/X-check + Bet recommendation (after M2) + Final verdict -> the **revision** (reads
`drivers.yaml`/`portfolio.yaml` via Read if present, aggregates `driver_tags` from S3/S4/S5).
Synthesis writes ONLY the 10-field verdict draft (M2's target), not the corpus.

## Stages (`autonomous-analysis.mjs`, mode=full)

1. **INGEST** — `workflow({scriptPath: m3/m3-ingest.mjs}, {ticker, as_of})` -> `{regime, source_sufficiency, datapack_markdown, datapack_json, streams{S1..S6}}`.
2. **M1 INPUT** — `m1Input = datapack_json + merge of the CAGR seeds from S4`. `mergeS4CagrSeeds` (pure JS): `streams.S4.cagr_seed {bear,base,bull}` (FCF CAGR after research) swaps the `cagr` of `flat` scenarios unambiguously matched by name; front_tail/supercycle keep the S0 shape; provenance `cagr_s0` + `cagr_seed_source`. The P7 scenario table computes from the post-research seeds.
2.5. **XCHECK S0 (GIGO gate)** — in parallel with M1 valuation: a sonnet runner runs `m3/xcheck_s0_live.py` (hard datapack_json fields vs a fundamentals REST provider; FAIL = fundamentals out of tolerance, WARN = market drift, SKIP = no key/network/metric). FAIL aborts the run BEFORE the writers (opus); WARN/SKIP only logs + lands in `s0_xcheck`.
3. **M1 VALUATION** — a runner (sonnet, Bash+Write): write inputs to tmp, `python -m valuation --input <tmp> --json`, return the RAW engine JSON (no recomputing).
4. **CORPUS + SYNTHESIS (parallel, barrier)** — 7 opus pillar-writers -> `pillars{W1..W7}` (pillar prose); in parallel opus synthesis -> `{draft_markdown (## Thesis, ## Verdict, ## 1..## 10), verdict_card}` (DRAFT_SCHEMA). Both from the same bundle, no dependency.
5. **M2 ADVERSARIAL** — `workflow({scriptPath: m2/m2-adversarial.mjs}, {draft_markdown, bundle, as_of})` -> `{findings, gate_audit, symmetry_ok, unresolved, ...}`. Audits the 10-field draft; the pillar corpus is untouched.
6. **REVISION** — an opus agent: draft + findings (after the filter: high/med or verdict_impact; the full list stays in return.m2) + bundle + driver_tags -> `{closing_markdown (## Driver tagging + X-check, ## Bet recommendation, ## Final verdict), final_verdict_card, applied_fixes, defended}`.
6.5. **EDITORIAL** — the only stage that reads the WHOLE stitched report before publication (the writers ran in parallel, M2 audits only the 10-field draft). 1 opus AUDITOR (a per-section problem list: numeric contradictions, regime drift, multiple implied anchors, pre-verdicts in pillars, machinery codes, language coinages, past catalysts) -> opus PATCHERS in parallel ONLY for the sections with problems (anti-compression guard: a patch <70% of the original length = rejected).
7. **ASSEMBLER (pure JS)** — frontmatter + banner + post-editorial pillars (verbatim) + closing_markdown -> `final_report_markdown`. Zero re-compression.

**DOCTRINE_CORE = a single source:** M4 passes its doctrine core to m3 and m2 via
`args.doctrine_core` (the local fallbacks in m3/m2 are only for runs in isolation). The
pillar-writers also get a REGIME block (the binding S0 resolution - they cite it, they do not
re-decide) and a ban on bet language outside the Recommendation.

Nesting is one level (M4 calls M3 and M2; they do not call workflow() inside). The workflow is
pure calculation, no writes to disk in the middle (decision 4).

## Models

Pillar-writers (7) + synthesis + revision = **opus** (reasoning + verdict + prose, the highest
stakes). Runners (M1 + xcheck) = **sonnet** (mechanical plumbing). Ingest inherits S0=opus /
S1-S6=sonnet; M2 = 3xopus/round; editorial = 1 auditor + patchers opus (only the problem
sections). Cost of a full E2E: up to ~7 (writers) + ~2 (synthesis/revision) + ~9 (M2) + 1 (S0)
+ ~2-9 (editorial) = ~19-28 opus + ~8 sonnet -> opt-in.

## Modes (`args.mode`) — test seams

| mode | input (args) | use |
|---|---|---|
| `full` (default) | `{ticker, as_of}` | the full E2E pipeline |
| `synth_only` | `{bundle}` | test the synthesis on a bundle (without live M3) |
| `runner_only` | `{m1_input}` | test the runner on an m1_input JSON |
| `revise_only` | `{draft_markdown, m2, bundle}` | test the revision -> `{closing_markdown, final_verdict_card, applied_fixes, defended}` |
| `redakcja_only` | `{pillars, closing_markdown, final_verdict_card, regime, valuation, datapack_markdown?}` | test the editorial -> `{final_report_markdown, redakcja}` |
| `xcheck_only` | `{m1_input}` | test the GIGO gate -> `{s0_xcheck:{status,note}, raw}` (1 sonnet; the script is also testable without an agent: `python m3/xcheck_s0_live.py <file>`) |

## Contract: M4 return (`validate_m4.py`)

`{ ticker, as_of, regime, source_sufficiency, datapack_markdown, m1_input, valuation,
streams, pillars, draft_markdown, verdict_card, m2, redakcja, final_report_markdown,
final_verdict_card, drivers }`

`validate_m4.py` also enforces the presence of `drivers` in the return. Informational keys
(outside RETURN_KEYS, the validator tolerates): `redakcja` = `{issues, fixed, note}`,
`s0_xcheck` = `{status, note}` (GIGO gate), `m1_seed_merge` = `{applied, note}` (S4 seed merge).

`drivers` = the canonical deduplicated list {id, dir, sens} from the revision (= the `### Driver
tag` block); the main thread builds the card frontmatter `drivers:` from it (NOT from the raw
`streams[*].driver_tags`, which are noisy/duplicated). The revision writes the closing with
PROCESS SILENCE (zero words M2/draft/gate/stream in the report prose).

- DRAFT_SCHEMA: `verdict_card.verdict in {BUY,WAIT,PASS}`, `conviction in {high,medium,low}`, `thesis` non-empty; `draft_markdown` has headings `## 1.` .. `## 10.`.
- the `m2` block passes `validate_m2.check` (reuse).
- `valuation` non-empty; `streams`/`pillars` present (corpus persistence).
- `final_report_markdown` is the FULL corpus: it must have `## Step 0`, `## Pillar 1..8`, `## Final verdict` (a bare verdict with no pillars = FAIL — guards against the old failure mode).
- `final_verdict_card` with the enums.

> Note: the private live pipeline this was exported from writes in Polish and its `validate_m4.py`
> enforces a Polish-diacritics floor on the report and datapack (to catch ASCII-stripped output).
> This public English export drops that diacritic gate - it is meaningless in English.

## Validation

- **Deterministic (free):** `python m4/validate_m4.py m4/_runs/<T>-m4.json` — the return-contract
  gate (must be PASS before persisting).
- **Syntax-check `.mjs` (wrapper-aware):** the script has top-level `return`/`await`/`export`,
  which the Workflow runtime wraps in an async fn. A bare `node --check` throws "Illegal return
  statement" (NOT a gate). Wrap the body in an async fn + strip `export`, then `node --check`.
- **Component (opt-in, cheap 1-2 agents):** synth_only -> DRAFT_SCHEMA PASS ; runner_only ->
  reconciliation with `python -m valuation --json` ; revise_only -> verdict divergence resolved
  + a flag section.
- **Full E2E (opt-in, expensive):** run on any ticker; validation = `validate_m4.py` PASS + a
  qualitative review of the report.

## Persistence (main thread, after the workflow returns)

The workflow returns a clean object; the **main thread** persists 3 artifacts (Write) to your
research vault (the workflow itself has no side effects). Convention (`artifact_paths(ticker, as_of)`,
date = as_of; missing -> currentDate):

1. `python m4/validate_m4.py m4/_runs/<T>-m4.json` -> must be PASS (the review gate).
2. `analyses/<T>/_sources/<date>-autonomous-data-pack.md` <- `datapack_markdown`
3. `analyses/<T>/<date>-autonomous-full-analysis.md` <- `final_report_markdown`
4. `analyses/<T>/_<T>.md` <- the card from `final_verdict_card` (create/update)

## Files

| File | Role |
|---|---|
| `../autonomous-analysis.mjs` | the 8-stage orchestrator + 6 modes (self-contained, sandbox) |
| `../m3/xcheck_s0_live.py` | GIGO gate: live cross-check of datapack_json vs a fundamentals REST provider (stage 2.5) |
| `validate_m4.py` | check_draft + check_return (reuses validate_m2) + artifact_paths + CLI |
| `_runs/` | outputs (`<T>-m4.json`, tmp) - not shipped with the public repo |

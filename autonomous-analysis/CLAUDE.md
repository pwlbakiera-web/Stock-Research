# CLAUDE.md — how a model runs this repo

This is an **autonomous equity-research orchestrator**. The intended operator is an agent
(Claude Code, or any compatible agentic runtime) acting as **both the orchestrator and the
executor** — you drive the pipeline, call the sub-scripts, and persist the output. A human
gives you one ticker; you return a full analyst-grade report.

Read **`DOCTRINE.md`** first — it is the source of truth for the decision posture (what a
verdict may and may not say). Read **`README.md`** for the module map and **`overview.html`**
for a visual walkthrough.

## What to install

- **Python 3.10+** — runs the deterministic valuation engine (`valuation/`) and the
  structural validators. Standard library only, no `pip install` needed.
- **An agentic Workflow runtime** — the `.mjs` orchestrators (`autonomous-analysis.mjs`,
  `m2/`, `m3/`) are written for a sandboxed harness that provides the globals `agent()`,
  `workflow()`, `parallel()`, `pipeline()`, `phase()`, `log()`, `args`. They are **not**
  plain-`node` scripts. Point `AA_DIR` (top of `autonomous-analysis.mjs`) at your clone.
- **Web-research tools** — the S0–S6 streams need an `agent()` that can search and read the
  web. The reference setup wires **local MCP servers**: a deep-research/search MCP (primary),
  plus `jina` (page reads) and `serper` (search) as helpers. Swap in your own equivalents.
- **Optional: a fundamentals API** — `m3/xcheck_s0_live.py` confirms the hard financials
  (the GIGO gate) against [fiscal.ai](https://fiscal.ai). Without a key it SKIPs, never fails.

## Keys

Put secrets in the environment or a **repo-root `.env`** (gitignored — never commit):

```
FISCAL_AI_API_KEY=...    # optional; only for the live GIGO cross-check
```

Any MCP/provider credentials live in your runtime's config, not in this repo.

## Model map (which model does what)

- **opus** — everything where reasoning, data integrity or verdict quality is at stake: S0
  (data pack + regime), the 7 pillar-writers, the synthesis, the revision, the editorial
  audit, and the 3 M2 adversarial roles.
- **sonnet** — the parallel research streams S1–S6, and the mechanical runners (M1 valuation
  runner, the xcheck runner).
- **pure Python** — M1 valuation. Zero model: identical inputs → identical numbers.

## How to run

**Full pipeline (the normal path):**

```
Workflow {scriptPath: ".../autonomous-analysis.mjs", args: {ticker: "TICKER", as_of: "YYYY-MM-DD"}}
```

It ingests (M3), values (M1), writes the 8-pillar corpus + a 10-field verdict, red-teams it
(M2), tempers it (revision), audits the whole report (editorial), and returns one clean
object. `as_of` is passed via `args` because the sandbox has no `Date`.

**After the workflow returns**, the main thread persists 3 artifacts to your research vault
(the workflow itself writes nothing to disk): the data pack, the full analysis, and the
verdict card — see `m4/README.md` → Persistence for the paths and the `validate_m4.py` gate.

**Engine only (deterministic, no model):**

```bash
python -m valuation --input input.json          # Markdown report
python -m valuation --input input.json --json    # raw structured results
```

`input.json` is one company's verified data pack; the M3 step produces it automatically. To
hand-build one, see the input schema in `valuation/README.md`.

## Guardrails baked in

- **GIGO** — no trusted number, no computation. S0 flags `est.` and lowers conviction rather
  than inventing; the live cross-check aborts the run on a hard-field mismatch.
- **False-precision tax** — every figure on a 5+ year horizon is a scenario artifact, not a
  forecast. Do not present it as knowledge of the future.
- **Symmetric red-team** — M2 attacks the bull and the bear equally; only a thesis that
  survives reaches the verdict.

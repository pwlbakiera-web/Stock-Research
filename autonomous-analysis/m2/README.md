# M2 - the adversarial pass

The M2 step of the `autonomous-analysis` tool. It attacks the synthesis draft BEFORE it
reaches the user: symmetrically (bull and bear separately) plus an audit of the 5 doctrine
gates. Doctrine: only a thesis that survives the barrage reaches the user. M2 does NOT
rewrite the draft (that is M4) - it returns clean findings + a gate audit; unresolved ones
(`unresolved`) go through as a flag.

## Files

| File | Role |
|---|---|
| `m2-adversarial.mjs` | Self-contained Workflow script: 3 opus roles (bull/bear/gate) in parallel/round, loop-until-dry cap 3, merge+dedup. Returns the M2 bundle. |
| `validate_m2.py` | Deterministic structural check of the M2 output (schema, symmetry, gates, stop). Testable core `check(bundle)`. |
| `_runs/` | Output of runs (e.g. `<TICKER>-m2.json`) for validation. |
| `README.md` | This file. |

> The `_runs/` and `_fixtures/` folders hold example run artifacts and are not shipped with
> the public repo. To run the must-catch quality check below you supply your own draft +
> bundle (see the I/O contract).

## Roles (mandates, all opus)

| Role | Mandate | Looks for |
|---|---|---|
| `attack_bull` | Assume the long thesis (BUY) is wrong | overstated growth, ignored risk, optimistic valuation, a weak edge, an exo lever |
| `attack_bear` | Assume the "wait/it will fall" thesis is wrong | understated TAM, missed levers, mid-cycle from a reflex, tail-as-WAIT, a broken "default actionable" |
| `gate_audit` | For each of the 5 gates: pass\|fail + a finding on fail | regime, mid-cycle deliberate, tail-as-distribution, verdict actionable, edge named |

Symmetry is enforced STRUCTURALLY (separate bull/bear mandates), because one agent drifts toward asymmetry.

## I/O contracts

**Input (via `args` - the Workflow sandbox has no FS):**
- `draft_markdown` - the synthesis draft: thesis + verdict card + 10 doctrine fields (prose). Contract `DRAFT_SCHEMA`, which M4 conforms to.
- `bundle` - hard data to confront it with: `{ ticker, as_of, regime{call,rationale}, datapack_json{...}, valuation{mode,...}, streams{S1..S6} }`.
- `as_of` - optional (fallback when absent from the bundle).

**Output (return):**
```
{ ticker, as_of, rounds_run, stopped_reason: "dry"|"cap",
  findings: [ { side:"bull"|"bear"|"gate_1".."gate_5", severity, claim, evidence_or_gap, recommended_fix, status:"resolved"|"unresolved", verdict_impact } ],
  gate_audit: { gate_1:{verdict:"pass"|"fail"}, ... gate_5 },
  symmetry_ok: bool,        # >=1 bull and >=1 bear
  unresolved: [FINDING, ...] # the status=unresolved subset -> a flag in the report }
```

## The loop (loop-until-dry, fan-out of 3 roles)

Per round, 3 opus roles in parallel (bull/bear/gate). After a round: merge findings + dedup.
Dedup key = `side` + a normalized shorthand of the charge (lowercase, first ~6 words). The
next round gets the "already found" list in the prompts (it looks for NEW holes). Stop: a
round brought nothing new after dedup (`dry`) OR `cap`=3 (`cap`).

## The 5 doctrine gates (audit)

1. Regime named explicitly and consistently? (cyclical vs structural TAM expansion). AI play -> structural by default; mid-cycle as a guess forbidden.
2. Mid-cycle used deliberately, not from a reflex? (only after passing gate 1 on the cyclical side).
3. Tail (>2-3 years) as a distribution of scenarios, not a pretext to WAIT?
4. Verdict actionable by default? (a strong structural signal = tranches now; WAIT requires EV(wait)>EV(act) + a trigger).
5. Edge named (variant perception)? None -> PASS/WAIT, not BUILD.

## Validation (M2 acceptance criterion)

**1. Structural (deterministic, hard):**
```bash
cd autonomous-analysis
python m2/validate_m2.py m2/_runs/<TICKER>-m2.json
```
PASS = top-level keys, non-empty findings with 7 fields, bull/bear symmetry consistent with
the flag, gate_audit for gate_1..gate_5 with a pass|fail verdict, stopped_reason in {dry,cap},
rounds_run 1..3, unresolved consistent. FAIL -> iterate the prompts.

**2. Must-catch (qualitative, soft):** run M2 on your own draft + bundle; check that the
findings/gate_audit address the known weaknesses you planted (a verdict divergence, a wrong
regime call, mid-cycle from a reflex, tail-as-WAIT). The LLM is non-deterministic - this is a
quality proxy.

## Run (REQUIRES the user's opt-in to Workflow)

```
Workflow {scriptPath: ".../m2/m2-adversarial.mjs",
          args: {draft_markdown: <draft content>, bundle: <bundle object>, as_of:"2026-06-15"}}
```
Save the output (return) to `m2/_runs/<T>-m2.json`, then run the validator. A Workflow run
fires up to ~9 opus agents (3 roles x up to 3 rounds).

## What M2 deliberately does NOT do

- Does not rewrite the draft (that is M4/synthesis) - returns only findings + audit.
- No per-finding verification panel (it is not 100 findings - it is one draft).
- Does not compose the full pipeline (M4 does that via `workflow({scriptPath})`).
- Does not fetch data - it receives a ready bundle.

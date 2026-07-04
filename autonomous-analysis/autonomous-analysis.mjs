// M4 - the full autonomous-analysis pipeline + synthesis of the 10 doctrine fields.
//
// A SELF-CONTAINED Workflow script. 8 stages: ingest(m3) -> M1 input (merge S4 seeds)
// -> xcheck S0 (GIGO gate, fundamentals REST) + M1 valuation (runners in parallel)
// -> pillars + synthesis(opus) -> M2(adversarial) -> revision(opus) -> EDITORIAL (whole-report
// consistency audit + targeted section patches). Ingest and M2 = nested workflow({scriptPath})
// (one level deep - legal). The workflow is pure calculation; persistence of the 3 files happens
// in the main thread (decision 4). Sandbox: no imports/FS/Date; prompts+schemas are INLINE.
// DOCTRINE_CORE is passed down to m3/m2 via args.doctrine_core (a single source).
//
// Modes (args.mode): full (default) | synth_only | runner_only | revise_only | redakcja_only | xcheck_only - test seams.
//   full:          Workflow {scriptPath: ".../autonomous-analysis.mjs", args:{ticker:"TICKER", as_of:"2026-06-15"}}
//   synth_only:    args:{mode:"synth_only", bundle:<bundle.json>}
//   runner_only:   args:{mode:"runner_only", m1_input:<m1_input.json>}
//   revise_only:   args:{mode:"revise_only", draft_markdown:<draft.md>, m2:<m2.json>, bundle:<bundle.json>}
//   redakcja_only: args:{mode:"redakcja_only", pillars:{W1..W7}, closing_markdown, final_verdict_card, regime, valuation, datapack_markdown?}
//   xcheck_only:   args:{mode:"xcheck_only", m1_input:<datapack_json>} -> deterministic cross-check vs fundamentals REST

export const meta = {
  name: 'autonomous-analysis-m4',
  description: 'M4 pipeline: ingest(m3) -> M1 valuation -> synthesis(opus) -> M2(adversarial) -> revision(opus)',
  phases: [
    { title: 'Ingest', detail: 'workflow m3: S0 (opus) + S1-S6 (sonnet)' },
    { title: 'Xcheck S0', detail: 'runner sonnet: xcheck_s0_live.py vs fundamentals REST (GIGO gate)', model: 'sonnet' },
    { title: 'Valuation M1', detail: 'runner sonnet: python -m valuation --json', model: 'sonnet' },
    { title: 'Pillars', detail: '7 opus writers in parallel: the 8-pillar corpus (prose verbatim)', model: 'opus' },
    { title: 'Synthesis', detail: 'opus: draft of the 10 fields + verdict card', model: 'opus' },
    { title: 'M2 adversarial', detail: 'workflow m2: 3 roles x loop-until-dry cap 3' },
    { title: 'Revision', detail: 'opus: Driver/X-check + Recommendation after M2 + Final verdict', model: 'opus' },
    { title: 'Editorial', detail: 'opus: consistency audit of the stitched report + targeted section patches', model: 'opus' },
  ],
}

// Absolute paths (forward slashes work on Windows in Node). Nesting is one level deep.
// The Workflow sandbox has no __dirname, so nested workflow() calls need AA_DIR hard-coded.
// Set this to wherever you cloned the repo.
const AA_DIR = '/absolute/path/to/autonomous-analysis'
const M3_PATH = AA_DIR + '/m3/m3-ingest.mjs'
const M2_PATH = AA_DIR + '/m2/m2-adversarial.mjs'
// Optional: a personal research vault the revision X-check reads (drivers.yaml + portfolio.yaml)
// for portfolio-correlation. Leave as placeholders to skip it - the prompt flags a missing file
// rather than inventing positions.
const VAULT_ROOT = '/absolute/path/to/your/research-vault'
const DRIVERS_YAML = VAULT_ROOT + '/drivers.yaml'
const PORTFOLIO_YAML = VAULT_ROOT + '/portfolio.yaml'

// ---------------------------------------------------------------------------
// Doctrine core - pasted into the synthesis and revision prompts (deep-research is not
// callable inside Workflow; mirrored in M2/M3). Contains the PER-SEGMENT mid-cycle refinement.
// ---------------------------------------------------------------------------
const DOCTRINE_CORE = `
OVERRIDING RULES (from DOCTRINE.md - non-negotiable):
- INTEGRITY: never invent numbers. Every claim is backed by a number from the bundle or an explicitly named gap. An uncertainty flag != fabrication.
- LEAD WITH THE NUMBER: every evaluative sentence carries a number + variance vs expectations. A bare adjective -> cut it.
- THE IMPLIED-VS-ACTUAL GAP is the only anchor of the verdict. Price level / "how much it rose" / the absolute multiple -> noise. Asymmetry = the size of the gap, not the distance from an invented target price.
- FALSE-PRECISION TAX: every 5y+ figure is a scenario artifact (mark it), not a measurement.
- THE TAIL (>2-3 years) = a distribution of scenarios with conviction (high/medium/low), NOT a proof and NOT a WAIT trigger.

REGIME GATE + MID-CYCLE PER-SEGMENT (M4 refinement):
- The regime is named explicitly: cyclical normalization vs structural TAM expansion. An AI play -> structural BY DEFAULT.
- Mid-cycle normalization is NOT binary at the company level - you weight it PER-SEGMENT by the segment's share (from the datapack breakdown):
  * Segments benefiting from AI (e.g. datacom) -> NO mid-cycle. Assume the AI cycle continues; look at how the company earns + how much the market prices in (the implied-vs-actual gap) + a scale sanity-check.
  * Segments outside the AI boom -> a mid-cycle review is allowed.
  Weight the normalization decision by segment share, not one switch for the whole company.

10 VERDICT FIELDS (draft structure - each as a section "## N. <title>"):
1. Edge/variant perception (none provable -> PASS/WAIT, not BUY). 2. State of knowledge (certain vs guess). 3. Hypothesis + what must be true + horizon. 4. Outside view (base rate + why the exception). 5. Implied vs actual (what growth the price prices in vs the real one). 6. Asymmetry now (upside vs downside). 7. Thesis-breakers. 8. Bet recommendation (tranches, or wait + an OPERATIONAL trigger, not a price one). 9. Take-profit condition. 10. Frozen expectation (date).

5 DOCTRINE GATES (the synthesis must pass them AT THE SOURCE):
1. REGIME named and applied CONSISTENTLY (field 1 vs field 6).
2. MID-CYCLE per-segment, not from a reflex (see above).
3. TAIL as a weighted distribution, not a pretext to WAIT.
4. VERDICT actionable by default: a strong structural signal -> tranches NOW; WAIT requires an explicit EV(wait)>EV(act) + an OPERATIONAL trigger (not a price one).
5. EDGE named; driver-tagging X-check (endo/partial/exo) before the verdict.

CLARITY AND UNITS (checklist - every company, not just this one; from DOCTRINE.md):
1. EXPLAIN BEFORE USE: no term/metric in an evaluative sentence or statistic before it is defined in one sentence. Applies to CONCEPTS, not only acronyms (Pixel, Conversions API, run-rate, ad load as much as ROAS/PP&E). Definition -> then the number.
2. UNITS: every number marked "for the quarter (actual)" vs "run-rate (annualized, est.)". FORBIDDEN: summing a run-rate with quarterly data; presenting a quarterly number as annual; tacking a product run-rate ON TOP OF the revenue it is already contained in.
3. FISCAL ANCHOR: at the top state the fiscal vs calendar year + which quarter = which period (e.g. "FY2025 through 12-31; Q1'26 = Jan-Mar").
4. MECHANISM: spell out WHY for every counterintuitive claim (e.g. impressions=supply, price=auction equilibrium). No mechanism -> no conclusion.
5. SUPPLY vs DEMAND: in volume x price metrics (impressions x price, units x ASP, users x ARPU) name which leg is supply and which is demand; both rising together = demand faster than supply (a qualitative signal).
6. FORWARD NORMALIZATION = A SCENARIO: capex->depreciation, mid-cycle margin, "capex will fall" -> an explicit assumption + a counter-scenario as a thesis-breaker. Trailing and peak-year can BOTH be unrepresentative - say so.
7. NO FLASHY ONE-LINERS: every classification/demarcation tied to a consequence for the bet/valuation (e.g. booked=into the DCF; no revenue model=market ~zero=a free option). An aphorism with no consequence -> cut it.
8. REGIME WITHOUT OVERREACH: distinguish share-taking + a monetization uplift from pure TAM expansion (greenfield); name the ceiling (the whole market) and the pendulum factor (a capex supercycle). "Unlimited expansion" requires proof.
9. LAYPERSON SECTION FROM THE BASICS: start with the location (where in the value chain, what the company sells), then the mechanics. Not from advanced detail.
10. AUDIT PROSE -> A BLOCK: provenance / "source sufficiency" / gaps = a concise block (<=3 sentences or bullets), not a narrative paragraph duplicating the datapack.

STYLE: clear, plain English; one thought = one sentence; en-dash (-) not em-dash; prefer "structural" over "secular".
`.trim()

// ---------------------------------------------------------------------------
// Helper: parse the raw STDOUT of the M1 runner into an object (strip any fence,
// take from the first { to the last }). Fidelity of M1 numbers - no recomputing.
// ---------------------------------------------------------------------------
function parseRunnerJson(text) {
  if (text && typeof text === 'object') return text
  let s = String(text || '').trim()
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) s = fence[1].trim()
  const i = s.indexOf('{')
  const j = s.lastIndexOf('}')
  if (i >= 0 && j > i) s = s.slice(i, j + 1)
  return JSON.parse(s)
}

// ---------------------------------------------------------------------------
// Schemas (DRAFT/REVISION) + agents: synthesis (opus), M1 runner (sonnet), revision (opus).
// Inline (Workflow sandbox has no imports). Mode bodies are at the end of the file.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// PILLAR-WRITERS (decision A) - 7 opus agents in parallel write the FULL PROSE of the
// 8-pillar corpus. Each gets the datapack + its stream(s) (+ valuation where numeric).
// Output = section markdown verbatim; the assembler stitches WITHOUT re-compression
// (kills the failure mode: one agent collapses 8 pillars into a verdict card). Budget per
// writer ~= one full pillar; pair only light+light / thematically coupled. Array order
// = report order.
// ---------------------------------------------------------------------------
const WRITER_SCHEMA = {
  type: 'object',
  required: ['markdown'],
  properties: {
    markdown: { type: 'string', description: 'Full section prose, from the first heading; no leading/trailing ---.' },
  },
}

const PILLAR_WRITERS = [
  {
    key: 'W1', label: 'Header+Note+Step0', streams: [], valuation: false,
    brief: `
Headings in this order:
1. "# <Full company name> (<EXCHANGE>: <TICKER>) - full 8-pillar analysis" + below it 3 bold lines:
   **Reference price:** <price as_of> | **Market cap:** <...> | **EV:** <...>
   **Sector:** <layer/industry + main end-markets>
   **Mode:** autonomous analysis; tests the thesis independently.
2. "## Methodological note" - 1-2 paragraphs: the key correction / framing assumption (e.g. refuting an unconfirmed consensus anchor, a cyclical modifier). This is the axis of the recommendation.
3. "## Step 0: Classification":
   - "### Phase per segment + composite" + a TABLE (segment | last-quarter sales | organic YoY growth | op. margin | phase 1-6 | rationale) + a paragraph on the classification tension (composite phase vs the market multiple).
   - "### Lynch modifier" (if applicable: cyclical/turnaround/etc. + the consequence for valuation).
   - "### Valuation method" (phase -> the right primary/secondary multiples + controls; reverse-DCF).
   - "### KPI focus direction" (which metrics settle the thesis).
   - "### Step 0 summary".`,
  },
  {
    key: 'W2', label: 'P1 Operational', streams: ['S1'], valuation: false,
    brief: `
"## Pillar 1: Deep Dive Operational":
- "### Business mechanics" - one paragraph: what the company does, where it sits in the value chain.
- "### Revenue breakdown - segments" + a TABLE (segment | sales | % of group | YoY | organic growth | op. margin | comment).
- "### Revenue breakdown - end-markets" + a TABLE (if data available; otherwise flag the gap).
- "### Unit economics" (profitability of the unit of analysis; gross/op margin, ROIC as background).
- "### Who buys, frequency, pricing power" (B2B/B2C, repeatability, pricing power + what limits it).
- "### Recession resilience" (mission-critical vs discretionary, per segment).
- "### Pillar 1 summary".`,
  },
  {
    key: 'W3', label: 'P2 Moat + P3 Risk', streams: ['S2', 'S3'], valuation: false,
    brief: `
Two pillars; separate them with a "---" line.
"## Pillar 2: Moat":
- "### Five sources" - network effect (reach test), switching costs, low-cost production, intangibles, counterpositioning; EACH with a rating (none/narrow/wide) + a numeric proof or a flagged gap.
- "### State" (wide / narrow / none).
- "### Direction" (widening / stable / shrinking) - MORE IMPORTANT than the state; narrow-and-widening > wide-and-shrinking.
- "### Pillar 2 summary".
---
"## Pillar 3: Execution Risk":
- "### 1. Customer concentration" (red flag: one customer >20%; is the mix diversifying; hidden concentration).
- "### 2. Disruption" (disrupted vs disruptor; direction matters more).
- "### 3. External forces" (regulation, commodities, rates, macro/politics, export controls/tariffs/China, FX).
- "### 4. Competition" (players + entrants + substitutes; attack on margin vs on volume).
- "### 5. Technology risk" (2-5 year scenarios + early warning signals).
- "### Pillar 3 summary".`,
  },
  {
    key: 'W4', label: 'P4 Financial', streams: [], valuation: true,
    brief: `
"## Pillar 4: Financial Analysis" (the most numeric pillar - use DATA PACK section F + the M1 valuation):
- "### 1. Revenue, margin, profit trend + 3-year CAGR" + a TABLE (line | FY-3 | FY-2 | FY-1 | TTM | 3Y CAGR).
- "### 2. Segments" (which one pulls the group up/down).
- "### 3. Financial health (balance sheet)" + a TABLE (total debt | cash | net debt | net leverage | interest coverage | goodwill | intangibles + assessment).
- "### 4. Cash flow and earnings quality" (OCF/FCF vs NI, FCF margin, SBC-adjusted).
- "### 5. Results vs estimates + forward" + a TABLE (last-quarter beat/miss + FY1/FY2 revenue+EPS consensus).
- "### 6. ROIC, FCF margin, trend" (level + direction; >15% ROIC = quality).
- "### 7. Sector KPIs" + a TABLE (industry KPIs read + signal).
- "### Pillar 4 summary".`,
  },
  {
    key: 'W5', label: 'P5 Growth + P5.5 Lever Bridge', streams: ['S4'], valuation: true,
    brief: `
Two pillars; separate them with a "---" line.
"## Pillar 5: Growth Potential":
- "### TAM / SAM" (size, penetration, where the ceiling is; give a number or "est.").
- "### Growth levers" (numbered: new customers, more from existing, geography, new products/second TAM, pricing, M&A).
- "### S&M / character of growth" (organic vs bought).
- "### Orders / book-to-bill" (demand signal; ambiguity in a boom).
- "### Catalysts".
- "### Pillar 5 summary".
---
"## Pillar 5.5: Promise Check / Lever Bridge":
- "### 1. Lever bridge (current -> implied target)" + a TABLE (lever | contribution to the bridge | tag endo/partial/exo | comment).
- "### 2. Control tag" (is most of the swing in exo/partial -> a bet on the cycle, not the company - say it outright).
- "### 3. Credibility test" (per endo lever: the proving metric + the tension).
- "### 4. Verdict (self-help vs weather)" (a % split weather vs self-help).
- "### 5. Verification questions".
- "### Pillar 5.5 summary".`,
  },
  {
    key: 'W6', label: 'P6 Outlook', streams: ['S5'], valuation: false,
    brief: `
"## Pillar 6: Outlook":
- "### 1. What management said (guidance)" + a TABLE (line | guide | YoY) + framing from the call.
- "### 2. Execution vs promises" (sandbagging pattern: guide vs delivered).
- "### 3. Consensus vs guidance" (agreement/divergence, especially FY2).
- "### 4. Communication red flags".
- "### 5. Transcript Analysis" - >=1 call, 6 lenses: (1) hedging language, (2) dodged/unanswered questions, (3) language changes vs the prior quarter, (4) what was NOT said, (5) signals hidden in a positive narrative, (6) unexpected admissions of risk. Per lens: quote -> interpretation -> severity (Low/Medium/High).
- "### Closing paragraph" (the narrative crux: how management's main thesis evolved).
- "### Pillar 6 summary".`,
  },
  {
    key: 'W7', label: 'P7 Valuation + P8 Sentiment', streams: ['S6'], valuation: true,
    brief: `
Two pillars; separate them with a "---" line. P7 uses the M1 valuation (engine JSON).
"## Pillar 7: Valuation":
- "### Current multiples + growth context" + a TABLE (multiple | value | reading relative to growth; PEG = multiple vs pace).
- "### Full Reverse-DCF" (what the current price implies; implied vs actual growth).
- "### Mid-cycle control" (if cyclical: fair value on normalized EPS).
- "### Bull / Base / Bear" + a TABLE (scenario | what must be true | price implication | key variable).
- "### Pillar 7 summary".
---
"## Pillar 8: Sentiment + Management Assessment":
- "### Sentiment" (bulls vs bears; consensus PT as SENTIMENT and the revision direction, NOT a valuation anchor; insider trading; short interest + trend; momentum).
- "### Management Assessment" (track record/tenure; execution vs promises; shareholder friendliness - SBC %FCF, buyback, dividend; skin in the game).
- "### Pillar 8 summary".`,
  },
]

function pillarWriterPrompt(spec, ticker, bundle) {
  const datapack = bundle.datapack_markdown
    || (bundle.datapack_json ? JSON.stringify(bundle.datapack_json, null, 2) : '(no datapack)')
  const streamBlock = (spec.streams || []).length
    ? '\n\n=== RESEARCH STREAMS (summary/findings/driver_tags/thesis_breakers - input from the sonnets) ===\n'
      + spec.streams.map((k) => `--- ${k} ---\n${JSON.stringify((bundle.streams || {})[k] || {}, null, 2)}`).join('\n\n')
    : ''
  const valBlock = spec.valuation
    ? '\n\n=== M1 VALUATION RESULT (engine JSON - read DEFENSIVELY, use the fields that exist) ===\n' + JSON.stringify(bundle.valuation || {}, null, 2)
    : ''
  // The regime from S0 is BINDING for every writer - the absence of this block caused
  // the regime to flip-flop between pillars (each writer settled the gate on its own).
  const regimeBlock = bundle.regime
    ? '\n\n=== REGIME (binding resolution of the Regime gate from S0 - CITE, do NOT re-decide) ===\n'
      + JSON.stringify(bundle.regime, null, 2)
      + '\nYour section does NOT run its own regime gate. If data in your scope contradicts this resolution, name the tension as an open question - do not issue your own regime verdict.'
    : ''
  return `
You are PILLAR-WRITER ${spec.key} (${spec.label}) for the company ${ticker}. Model: opus. You write the FINAL PROSE of your report section. QUALITY TARGET = a full 8-pillar analysis with deep prose. NOT structured findings, NOT a summary - full prose ready to paste. Do NOT compress; depth > brevity.

BET-LANGUAGE BAN: verdict words (BUY/WAIT/PASS/tranches/starter/"build a position") do NOT appear in your section - the verdict is issued solely by the final Recommendation. A pillar summary names strengths and tensions, it does not issue a pre-verdict.

${DOCTRINE_CORE}${regimeBlock}

=== YOUR SECTION - mandatory structure ===
Start EXACTLY at the first heading from the spec. Write ALL sub-sections in the given order. End each pillar with "### Pillar N summary" = 3 bullets: **What's strong** / **What raises questions** / **What needs further work**. Do NOT begin or end the block with "---" (the assembler inserts the separators between sections).
${spec.brief.trim()}

=== DATA PACK (S0 - verified numbers with sources) ===
${datapack}${streamBlock}${valBlock}

TASK - return ONLY {markdown}: the full section prose. Lead with the number (every evaluative sentence has a number + variance vs expectations; cut a bare adjective). Tables where the structure needs them. A missing material fact you may pull from the web (WebSearch/serper_search/jina_read via ToolSearch) and adversarially verify; unknown -> flag "est."/"NOT VERIFIED", do not invent.
`.trim()
}

async function runPillarWriters(bundle) {
  phase('Pillars')
  log(`Pillars: ${PILLAR_WRITERS.length} opus writers in parallel (8-pillar corpus)`)
  const results = await parallel(
    PILLAR_WRITERS.map((spec) => () =>
      agent(pillarWriterPrompt(spec, bundle.ticker, bundle), {
        label: `${spec.key}:${spec.label}`, phase: 'Pillars', model: 'opus', schema: WRITER_SCHEMA,
      })
    )
  )
  const pillars = {}
  PILLAR_WRITERS.forEach((spec, i) => { pillars[spec.key] = results[i] ? results[i].markdown : null })
  const ok = PILLAR_WRITERS.filter((s, i) => results[i]).length
  log(`Pillars done: ${ok}/${PILLAR_WRITERS.length} writers returned prose`)
  return pillars
}

// ---------------------------------------------------------------------------
// ASSEMBLER - pure JS: frontmatter + banner + corpus (writer prose VERBATIM)
// + closing sections (revision). Zero re-compression of pillar prose (the heart of decision A).
// ---------------------------------------------------------------------------
function assembleReport(ctx) {
  const fm = [
    '---',
    'type: analysis',
    `ticker: ${ctx.ticker}`,
    `date: ${ctx.as_of || ''}`,
    'mode: autonomous',
    'source: "autonomous-analysis (M4)"',
    'status: "AUTONOMOUS DRAFT - no human review; verify numbers against a fundamentals provider / company IR"',
    '---',
  ].join('\n')
  const banner = '> WARNING: AUTONOMOUS ANALYSIS (AI) - generated without human review. NOT an approved investment thesis; numbers require verification (a fundamentals provider / company IR).'
  const blocks = []
  PILLAR_WRITERS.forEach((spec) => {
    const md = ctx.pillars && ctx.pillars[spec.key]
    if (md && md.trim()) blocks.push(md.trim())
  })
  if (ctx.closing_markdown && ctx.closing_markdown.trim()) blocks.push(ctx.closing_markdown.trim())
  return [fm, banner, blocks.join('\n\n---\n\n')].join('\n\n')
}

const DRAFT_SCHEMA = {
  type: 'object',
  required: ['draft_markdown', 'verdict_card'],
  properties: {
    draft_markdown: { type: 'string', description: 'Prose: ## Thesis, ## Verdict, then ## 1...## 10 (the 10 doctrine fields).' },
    verdict_card: {
      type: 'object',
      required: ['verdict', 'conviction', 'thesis'],
      properties: {
        verdict: { type: 'string', enum: ['BUY', 'WAIT', 'PASS'] },
        conviction: { type: 'string', enum: ['high', 'medium', 'low'] },
        thesis: { type: 'string', description: 'the investment thesis in 1-2 sentences' },
      },
    },
  },
}
const REVISION_SCHEMA = {
  type: 'object',
  required: ['closing_markdown', 'final_verdict_card', 'applied_fixes', 'defended', 'drivers'],
  properties: {
    closing_markdown: { type: 'string', description: 'Closing sections: ## Driver tagging + X-check, ## Bet recommendation (10 fields as ###), ## Final verdict. No leading/trailing ---. PROCESS SILENCE: zero words about M2/draft/revision/stream/gate/synthesis.' },
    drivers: {
      type: 'array',
      description: 'The canonical, deduplicated list of the company drivers (= the ### Driver tag block). id snake_case, no duplicates.',
      items: {
        type: 'object',
        required: ['id', 'dir', 'sens'],
        properties: {
          id: { type: 'string' },
          dir: { type: 'string', enum: ['+', '-'] },
          sens: { type: 'string', enum: ['high', 'med', 'low'] },
        },
      },
    },
    final_verdict_card: {
      type: 'object',
      required: ['verdict', 'conviction', 'thesis'],
      properties: {
        verdict: { type: 'string', enum: ['BUY', 'WAIT', 'PASS'] },
        conviction: { type: 'string', enum: ['high', 'medium', 'low'] },
        thesis: { type: 'string' },
      },
    },
    applied_fixes: { type: 'array', items: { type: 'string' }, description: 'findings folded into the report' },
    defended: {
      type: 'array',
      items: {
        type: 'object',
        required: ['finding', 'rationale'],
        properties: { finding: { type: 'string' }, rationale: { type: 'string' } },
      },
    },
  },
}
function synthPrompt(bundle) {
  const regime = bundle.regime || {}
  const datapack = bundle.datapack_markdown
    || (bundle.datapack_json ? JSON.stringify(bundle.datapack_json, null, 2) : '(no datapack)')
  const valuation = bundle.valuation || {}
  const streams = bundle.streams || {}
  return `
You are the SYNTHESIZER - the heart of M4. Model: opus. MANDATE: from the whole material (regime + datapack + M1 valuation result + streams S1-S6) build ONE coherent draft doctrine verdict: thesis + verdict card + 10 fields. Synthesis = single-context integration; the fields are NOT independent, so you guard global consistency, especially the verdict card vs the corpus (a real divergence: corpus WAIT vs card BUY - do NOT repeat it).

${DOCTRINE_CORE}

SYNTHESIS RULES (enforcing doctrine at the source - prevents gate-fails before they arise):
1. The verdict card MUST follow from the corpus - zero divergence. The verdict = a function of the implied-vs-actual gap + asymmetry, NOT the price level.
2. regime=structural -> do not normalize cyclically in field 6 for AI segments. Mid-cycle only for the NON-AI part, weighted by segment share.
3. The tail = a weighted distribution of scenarios with conviction, not a pretext to WAIT.
4. Default actionable: a strong structural signal -> tranches; WAIT requires EV(wait)>EV(act) + an OPERATIONAL trigger (not a price one).
5. Edge named (none provable -> PASS/WAIT). Driver-tagging X-check (endo/partial/exo) before the verdict.

=== REGIME (from S0) ===
${JSON.stringify(regime, null, 2)}

=== DATAPACK (hard data + prose; when JSON only - read it as source numbers) ===
${datapack}

=== M1 VALUATION RESULT (reverse-DCF or preprofit; structure depends on the engine mode - read DEFENSIVELY, use the fields that exist) ===
${JSON.stringify(valuation, null, 2)}

=== STREAMS S1-S6 (research: summary, findings, thesis_breakers, driver_tags) ===
${JSON.stringify(streams, null, 2)}

TASK - return ONLY the object {draft_markdown, verdict_card}:
- draft_markdown: full prose. MANDATORY ORDER: "## Thesis" (1-2 sentences), then "## Verdict" (BUY/WAIT/PASS + conviction), then EXACTLY 10 sections with headings "## 1. ..." through "## 10. ..." (numbering 1-10 is mandatory - the validator looks for ## 1. .. ## 10.).
- verdict_card: { verdict: "BUY"|"WAIT"|"PASS", conviction: "high"|"medium"|"low", thesis }.
The card MUST be consistent with field 8 and with the implied-vs-actual gap. Lead with the number. Do not invent - flag the gap.
`.trim()
}

async function runSynthesis(bundle) {
  phase('Synthesis')
  log('Synthesis: 1 opus agent -> draft of 10 fields + verdict card')
  const out = await agent(synthPrompt(bundle), {
    label: 'synthesis', phase: 'Synthesis', model: 'opus', schema: DRAFT_SCHEMA,
  })
  if (!out) throw new Error('Synthesis returned no result.')
  return { draft_markdown: out.draft_markdown, verdict_card: out.verdict_card }
}
function runnerPrompt(m1Input) {
  return `
You are the M1 RUNNER - mechanical plumbing (model: sonnet). You do NOT analyze, you do NOT compute - you are a pipe to the deterministic valuation engine. Fidelity of numbers = priority.

STEPS (execute literally):
1. Write the JSON inputs BELOW EXACTLY (verbatim, character for character) to the file: ${AA_DIR}/m4/_runs/_m1_input_tmp.json (the Write tool).
2. Run (Bash): cd "${AA_DIR}" && python -m valuation --input m4/_runs/_m1_input_tmp.json --json
3. Return the command's STDOUT EXACTLY as-is - clean JSON, WITHOUT a \`\`\` fence, without a comment, without recomputing or reformatting numbers.
If the command returns an error - return the error text literally (prefix "ERROR:").

=== M1 INPUT JSON (to be written verbatim) ===
${JSON.stringify(m1Input, null, 2)}
`.trim()
}

async function runRunner(m1Input) {
  phase('Valuation M1')
  log('Valuation M1: sonnet runner -> python -m valuation --json')
  const text = await agent(runnerPrompt(m1Input), {
    label: 'runner-m1', phase: 'Valuation M1', model: 'sonnet',
  })
  if (!text) throw new Error('M1 runner returned no result.')
  let valuation
  try {
    valuation = parseRunnerJson(text)
  } catch (e) {
    throw new Error('M1 runner: could not parse valuation JSON: ' + (e && e.message) + ' :: ' + String(text).slice(0, 300))
  }
  return valuation
}

// ---------------------------------------------------------------------------
// MERGE S4 SEEDS -> M1 INPUT (decision 3A). S4 (growth research) returns
// cagr_seed {bear, base, bull} - FCF CAGR after research; the S0 seeds were formed
// BEFORE research (from implied + consensus). Deterministic JS: it swaps cagr ONLY
// in scenarios of type="flat" unambiguously matched by name; front_tail and "supercycle"
// keep the S0 shape. Provenance in cagr_s0.
// ---------------------------------------------------------------------------
function mergeS4CagrSeeds(m1Input, streams) {
  const seed = streams && streams.S4 && streams.S4.cagr_seed
  const out = { input: m1Input, applied: [], note: '' }
  if (!seed) { out.note = 'no cagr_seed from S4 - S0 seeds unchanged'; return out }
  const valid = (v) => typeof v === 'number' && v > -0.5 && v < 1.0
  const cats = [
    { key: 'bear', re: /bear/i },
    { key: 'base', re: /base|central/i },
    { key: 'bull', re: /bull/i },
  ]
  const scenarios = Array.isArray(m1Input.scenarios) ? m1Input.scenarios.map((s) => ({ ...s })) : []
  cats.forEach(({ key, re }) => {
    if (!valid(seed[key])) return
    const hits = scenarios.filter((s) => s && typeof s.name === 'string'
      && re.test(s.name) && !/supercycle/i.test(s.name))
    if (hits.length !== 1) return // 0 or >1 matches = ambiguous - don't touch
    const sc = hits[0]
    if (sc.type !== 'flat' || typeof sc.cagr !== 'number' || sc.cagr === seed[key]) return
    sc.cagr_s0 = sc.cagr
    sc.cagr = seed[key]
    sc.cagr_seed_source = 'S4'
    out.applied.push(`${sc.name}: ${sc.cagr_s0} -> ${seed[key]}`)
  })
  if (out.applied.length) out.input = { ...m1Input, scenarios }
  out.note = out.applied.length
    ? `S4 seeds folded into ${out.applied.length} scenario(s)`
    : 'S4 cagr_seed present, but no flat scenario qualified for a swap'
  return out
}

// ---------------------------------------------------------------------------
// XCHECK S0 (GIGO gate) - deterministic cross-check of the hard datapack_json fields
// vs a fundamentals REST provider (m3/xcheck_s0_live.py). A sonnet runner = a pipe (like M1).
// FAIL = a confirmed divergence of fundamentals -> abort BEFORE the writers (opus).
// SKIP (no key/network) does not kill the run - only logs.
// ---------------------------------------------------------------------------
function xcheckPrompt(m1Input) {
  return `
You are the XCHECK RUNNER - mechanical plumbing (model: sonnet). You do NOT analyze, you do NOT judge - you are a pipe to the deterministic cross-check script.

STEPS (execute literally):
1. Write the JSON BELOW EXACTLY (verbatim) to the file: ${AA_DIR}/m4/_runs/_xcheck_input_tmp.json (the Write tool).
2. Run (Bash): cd "${AA_DIR}" && python m3/xcheck_s0_live.py m4/_runs/_xcheck_input_tmp.json
3. Return the command's FULL STDOUT EXACTLY as-is (including the table and the "XCHECK: ..." line), without a comment. The command may exit with a non-zero code - that is normal, return its output anyway.

=== JSON (to be written verbatim) ===
${JSON.stringify(m1Input, null, 2)}
`.trim()
}

async function runXcheck(m1Input) {
  phase('Xcheck S0')
  log('Xcheck S0: sonnet runner -> xcheck_s0_live.py vs fundamentals REST')
  const text = await agent(xcheckPrompt(m1Input), {
    label: 'xcheck-s0', phase: 'Xcheck S0', model: 'sonnet',
  })
  const raw = String(text || '')
  const m = raw.match(/XCHECK:\s*(PASS|WARN|FAIL|SKIP)\s*-?\s*([^\n]*)/)
  const status = m ? m[1] : 'SKIP'
  const note = m ? m[2].trim() : 'no XCHECK marker in the runner output'
  log(`Xcheck S0: ${status} - ${note}`)
  return { status, note, raw }
}
function revisionPrompt(draftMd, verdictCard, m2, bundle) {
  // M2 with a 3-round cap can return 60+ findings - the revision drowns in noise.
  // Only weighted findings (high/med or verdict_impact) go into the prompt; the full list stays in return.m2.
  const allFindings = (m2 && m2.findings) || []
  const findings = allFindings.filter((f) => f && (f.verdict_impact === true || f.severity === 'high' || f.severity === 'med'))
  const skippedCount = allFindings.length - findings.length
  const gateAudit = (m2 && m2.gate_audit) || {}
  const unresolved = (m2 && m2.unresolved) || []
  // driver_tags aggregated across the streams (mainly S3/S4/S5) - input for driver tagging + X-check.
  const streams = bundle.streams || {}
  const driverTags = []
  Object.keys(streams).forEach((k) => {
    const dt = streams[k] && streams[k].driver_tags
    if (Array.isArray(dt)) dt.forEach((t) => driverTags.push({ from: k, ...t }))
  })
  return `
You are the REVISER + CAPSTONE of M4. Model: opus. MANDATE: the 10-field verdict draft has been through the M2 barrage; you assemble the CLOSING SECTIONS of the report. The 8-pillar corpus (Pillar 1-8, Step 0) is written by SEPARATE writers - you do NOT touch or repeat THEIR prose. Your three sections (H2, in order): Driver tagging + X-check, Bet recommendation (the corrected draft after M2), Final verdict.

DISCIPLINE (receiving-code-review - rigor, not blind application):
- A VALID finding (backed by the bundle) -> fold it into the Recommendation + list it in applied_fixes.
- A WRONG finding -> DEFEND with evidence from the bundle, list it in defended {finding, rationale}.
- A verdict divergence (card vs corpus) MUST be RESOLVED one way (not flagged) - the verdict = the implied-vs-actual gap + asymmetry + gate 4 (default actionable).
- unresolved -> list it under "unresolved material gap" in the Final verdict.
- PROCESS SILENCE (critical): closing_markdown is a FINISHED product for the investor-reader, not a work journal. ZERO words describing the machinery: "M2", "draft", "revision", "synthesis", "stream", "gate", "barrage", "correction after...". Resolve divergences and fixes SILENTLY - write the FINISHED conclusion, not the history of how you got there. The reader sees a finished thesis. applied_fixes/defended (separate fields) are the place for the process trail, NOT the report prose.

${DOCTRINE_CORE}

=== TASK: closing_markdown - EXACTLY these 3 H2 headings, in order, no leading/trailing --- ===

1. "## Driver tagging + X-check":
   - "### Driver tag" - a \`\`\`yaml block with the company drivers (from DRIVER_TAGS below; {id, dir:+/-, sens}).
   - "### X-check (drivers.yaml + portfolio.yaml)" - READ (the Read tool) the files:
       ${DRIVERS_YAML}
       ${PORTFOLIO_YAML}
     For each company driver find the co-exposure in the portfolio / drivers.yaml; compute the net effect (dir x dir). File unavailable -> flag it, do NOT invent positions.
   - "### Read-through to the portfolio" - the directional correlation of the company thesis with the holdings (a hedge or a deepening of concentration).
   - "### Hedge / counter-thesis" - does the portfolio hold the opposite dir on this driver.
   - "### Leading indicator" - which co-exposed name reports earliest.
   - "### X-check summary" (3 bullets).

2. "## Bet recommendation (doctrine synthesis)" - the M2-corrected 10-field draft as ### headings:
   ### Edge / variant perception | ### State of knowledge | ### Hypothesis + what must be true + horizon | ### Outside view (base rate) | ### Implied vs actual | ### Asymmetry now | ### Thesis-breakers | ### Recommendation for NOW (+ an OPERATIONAL trigger, not a price one) | ### Take-profit condition | ### Frozen expectation (date).

3. "## Final verdict" - verdict + conviction + a synthesis paragraph (why) + a paragraph "unresolved material gap for the verdict" (from unresolved).

=== 10-FIELD DRAFT (basis of the Recommendation; after M2) ===
${draftMd}

=== DRAFT VERDICT CARD ===
${JSON.stringify(verdictCard || {}, null, 2)}

=== DRIVER_TAGS (aggregated across streams S3/S4/S5) ===
${JSON.stringify(driverTags, null, 2)}

=== M2 FINDINGS (charges + recommended_fix; after the filter: severity high/med OR verdict_impact; ${skippedCount} low findings without verdict impact were dropped) ===
${JSON.stringify(findings, null, 2)}

=== M2 GATE AUDIT ===
${JSON.stringify(gateAudit, null, 2)}

=== M2 UNRESOLVED ===
${JSON.stringify(unresolved, null, 2)}

=== BUNDLE (hard data for defense/fixes) ===
${JSON.stringify({ ticker: bundle.ticker, regime: bundle.regime, valuation: bundle.valuation, datapack_markdown: bundle.datapack_markdown, streams: bundle.streams }, null, 2)}

RETURN ONLY the object {closing_markdown, final_verdict_card, applied_fixes, defended, drivers}:
- closing_markdown: the 3 H2 sections as above (PROCESS SILENCE - no words M2/draft/gate/stream/revision).
- final_verdict_card: {verdict, conviction, thesis} - may differ from the draft; MUST be resolved (consistent with the Recommendation).
- applied_fixes: [string] - folded-in findings (HERE is the place for the process trail, not in the prose).
- defended: [{finding, rationale}] - findings refuted with evidence from the bundle.
- drivers: [{id, dir:+/-, sens:high/med/low}] - the canonical DEDUPLICATED list of the company drivers, EXACTLY the same as in the "### Driver tag" block. No duplicates, id snake_case.
Lead with the number. Do not invent - flag the gap.
`.trim()
}

async function runRevision(draftMd, verdictCard, m2, bundle) {
  phase('Revision')
  log('Revision: 1 opus agent -> Driver/X-check + Recommendation after M2 + Final verdict')
  const out = await agent(revisionPrompt(draftMd, verdictCard, m2, bundle), {
    label: 'revision', phase: 'Revision', model: 'opus', schema: REVISION_SCHEMA,
  })
  if (!out) throw new Error('Revision returned no result.')
  return out
}

// ---------------------------------------------------------------------------
// FINAL-STATE EDITORIAL - closes the gap: the corpus is written by parallel writers,
// M2 audits only the 10-field draft, so NOBODY read the whole thing before stitching.
// Symptoms seen in practice: bear +16% in P7 vs -13% in the Recommendation, the regime
// resolved inconsistently across P1/P5/P7, three implied anchors, pre-verdicts in pillars,
// machinery codes and language coinages in the prose. Architecture: 1 AUDITOR reads the whole
// thing -> a per-section problem list; then PATCHERS in parallel rewrite ONLY the sections with
// problems (bounded outputs - no risk of re-compressing the whole report or truncating the output).
// ---------------------------------------------------------------------------
const AUDIT_SCHEMA = {
  type: 'object',
  required: ['issues'],
  properties: {
    issues: {
      type: 'array',
      description: 'Consistency/style problems; an empty list = a clean report.',
      items: {
        type: 'object',
        required: ['section', 'instruction'],
        properties: {
          section: { type: 'string', enum: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'CLOSING'] },
          instruction: { type: 'string', description: 'A concrete fix instruction: what to change and to what (with numbers/a quote).' },
        },
      },
    },
    summary: { type: 'string', description: '1-3 sentences: the main axes of inconsistency (or "clean").' },
  },
}

function auditPrompt(labeledReport, finalVerdictCard, regime, valuation, datapackMd) {
  return `
You are the CONSISTENCY AUDITOR - the final-state editor of a report stitched from sections written IN PARALLEL by separate authors. Model: opus. You do NOT write new analysis - you find inconsistencies and issue CONCRETE fix instructions per section. Each instruction must be executable by an editor who sees ONLY their section: state what to change, to what value/wording, and why.

=== BINDING FACTS (settle every contradiction) ===
FINAL VERDICT CARD: ${JSON.stringify(finalVerdictCard || {}, null, 2)}
REGIME (gate from S0): ${JSON.stringify(regime || {}, null, 2)}
M1 VALUATION (implied-vs-actual anchor): ${JSON.stringify(valuation || {}, null, 2)}

=== DATA PACK S0 (source numbers for settling contradictions) ===
${datapackMd || '(none)'}

=== WHAT YOU LOOK FOR (in order of weight) ===
1. NUMERIC CONTRADICTIONS between sections: the same quantity, different values (e.g. bear +16% in one section vs -13% in another; different segment shares; different multiples). Settle in favor of the value consistent with the CARD/M1 VALUATION/DATA PACK; issue the losing section an instruction to rewrite (the report has no memory - the bad version disappears, it is not "corrected").
2. REGIME: any section that settles the regime gate on its own or contradicts the S0 resolution -> instruction: cite the binding regime, remove its own regime verdict.
3. MULTIPLE IMPLIED ANCHORS: different implied-growth values from different methods (FCFF/EV vs FCFE/MC vs Gordon) presented as equals -> instruction: ONE anchor (the M1 result, FCFF/EV), the others only as an explicitly named cross-check with an explanation of the difference.
4. PRE-VERDICTS in pillars: bet language (BUY/WAIT/tranches/starter) outside the CLOSING section -> instruction: rewrite as a summary of strengths/tensions without a verdict.
5. CONSISTENCY WITH THE CARD: scenarios/asymmetry/conclusions in a section contradicting the final verdict -> a fix instruction for the side inconsistent with the card.
6. MACHINERY CODES in the prose: "M1"/"M2"/"S0".."S6"/"stream"/"gate"/"draft"/"DATA PACK section F"/"exceeds_market=false" and similar -> instruction: rewrite as a plain sentence. EXCEPTION: source markers [S1]..[Sn] next to numbers STAY (that is provenance, like footnotes).
7. LANGUAGE: coinages/mangled terms, grammar broken after swaps, English state codes left bare ("NARROW/WIDE/NONE" - should be "narrow (state)" etc.).
8. CATALYSTS: PAST events listed as upcoming catalysts -> instruction: move them as evidence/confirmations, the catalysts section holds only future ones with a horizon.
Do NOT report meaningless cosmetics (single words, personal style). Do NOT change substantive theses consistent with the card. Better 5 concrete instructions than 30 trivia.

=== REPORT (sections marked <<<SECTION key>>>) ===
${labeledReport}

Return ONLY {issues:[{section, instruction}], summary}. No problems -> issues: [].
`.trim()
}

function patchPrompt(sectionKey, sectionMd, instructions, finalVerdictCard, regime) {
  return `
You are the SECTION EDITOR for ${sectionKey}. Model: opus. The whole-report auditor issued fix instructions for YOUR section. Execute them and return the FULL corrected section.

RULES:
- THE REPORT HAS NO MEMORY: a fix = a rewrite as if the wrong version never existed. Zero editing markers ("worth correcting", "previously stated").
- NO SHORTENING: the section stays at full length; you may remove ONLY the fragments explicitly named in the instructions (contradictory/working). The heading and table structure stays (except the values being corrected).
- While you are at it, fix WITHIN YOUR SECTION: language coinages/mangled terms, broken grammar, machinery codes of the pipeline (M1/M2/S0-S6/stream/gate) in the prose - source markers [S#] next to numbers you KEEP.
- Bet language (BUY/WAIT/tranches/starter) allowed ONLY in the CLOSING section; in the pillars, a summary without a verdict.
- Binding facts: CARD ${JSON.stringify(finalVerdictCard || {})} | REGIME ${JSON.stringify((regime && regime.call) || '')}.

=== AUDITOR INSTRUCTIONS ===
${instructions.map((x, i) => `${i + 1}. ${x}`).join('\n')}

=== SECTION (current content) ===
${sectionMd}

Return ONLY {markdown}: the full corrected section from the first heading, no leading/trailing ---.
`.trim()
}

async function runRedakcja(pillars, closingMd, finalVerdictCard, regime, valuation, datapackMd) {
  phase('Editorial')
  const sections = {}
  PILLAR_WRITERS.forEach((s) => { if (pillars && pillars[s.key]) sections[s.key] = pillars[s.key] })
  if (closingMd && closingMd.trim()) sections.CLOSING = closingMd.trim()
  const keysAll = Object.keys(sections)
  if (!keysAll.length) return { pillars, closing: closingMd, issues: 0, fixed: 0, note: 'no sections to edit' }

  const labeled = keysAll.map((k) => `<<<SECTION ${k}>>>\n${sections[k]}`).join('\n\n')
  log('Editorial: consistency auditor reads the whole stitched report')
  const audit = await agent(auditPrompt(labeled, finalVerdictCard, regime, valuation, datapackMd), {
    label: 'consistency-auditor', phase: 'Editorial', model: 'opus', schema: AUDIT_SCHEMA,
  })
  if (!audit) return { pillars, closing: closingMd, issues: 0, fixed: 0, note: 'auditor returned no result - report not edited' }
  const issues = (audit.issues || []).filter((i) => i && sections[i.section] && i.instruction)
  if (!issues.length) return { pillars, closing: closingMd, issues: 0, fixed: 0, note: audit.summary || 'audit clean' }

  const bySection = {}
  issues.forEach((i) => { (bySection[i.section] = bySection[i.section] || []).push(i.instruction) })
  const keys = Object.keys(bySection)
  log(`Editorial: ${issues.length} problems in ${keys.length} sections -> patchers in parallel`)
  const patched = await parallel(keys.map((k) => () =>
    agent(patchPrompt(k, sections[k], bySection[k], finalVerdictCard, regime), {
      label: `editorial:${k}`, phase: 'Editorial', model: 'opus', schema: WRITER_SCHEMA,
    })
  ))
  let fixed = 0
  keys.forEach((k, i) => {
    const md = patched[i] && patched[i].markdown
    // Anti-compression guard: a patch shorter than 70% of the original = rejected (protects decision A).
    if (md && md.trim() && md.trim().length >= sections[k].length * 0.7) { sections[k] = md.trim(); fixed++ }
  })
  log(`Editorial done: ${fixed}/${keys.length} sections patched (rejected patches = section unchanged)`)

  const newPillars = { ...(pillars || {}) }
  PILLAR_WRITERS.forEach((s) => { if (sections[s.key]) newPillars[s.key] = sections[s.key] })
  return { pillars: newPillars, closing: sections.CLOSING || closingMd, issues: issues.length, fixed, note: audit.summary || '' }
}

// ---------------------------------------------------------------------------
// Body: parse args (a string at top-level Workflow), switch on mode.
// ---------------------------------------------------------------------------
const ARGS = typeof args === 'string' ? JSON.parse(args) : (args || {})
const MODE = ARGS.mode || 'full'
const TICKER = ARGS.ticker || (ARGS.bundle && ARGS.bundle.ticker) || 'TICKER'
const AS_OF = ARGS.as_of || (ARGS.bundle && ARGS.bundle.as_of) || ''

if (MODE === 'synth_only') {
  const synth = await runSynthesis(ARGS.bundle || {})
  return { mode: 'synth_only', draft_markdown: synth.draft_markdown, verdict_card: synth.verdict_card }
}

if (MODE === 'runner_only') {
  const valuation = await runRunner(ARGS.m1_input || {})
  return { mode: 'runner_only', valuation }
}

if (MODE === 'xcheck_only') {
  const xc = await runXcheck(ARGS.m1_input || {})
  return { mode: 'xcheck_only', s0_xcheck: { status: xc.status, note: xc.note }, raw: xc.raw }
}

if (MODE === 'revise_only') {
  const rev = await runRevision(ARGS.draft_markdown || '', ARGS.verdict_card || {}, ARGS.m2 || {}, ARGS.bundle || {})
  return { mode: 'revise_only', ...rev }
}

if (MODE === 'redakcja_only') {
  const red = await runRedakcja(
    ARGS.pillars || {}, ARGS.closing_markdown || '', ARGS.final_verdict_card || {},
    ARGS.regime || {}, ARGS.valuation || {}, ARGS.datapack_markdown || ''
  )
  const report = assembleReport({ ticker: TICKER, as_of: AS_OF, pillars: red.pillars, closing_markdown: red.closing })
  return { mode: 'redakcja_only', final_report_markdown: report, redakcja: { issues: red.issues, fixed: red.fixed, note: red.note } }
}

// ---------------------------------------------------------------------------
// MODE === 'full' - the full 6-stage pipeline.
// ---------------------------------------------------------------------------
log(`M4 full: ${TICKER}${AS_OF ? ' @ ' + AS_OF : ''}`)

// (1) INGEST - nested m3 workflow (S0 + S1-S6). Pass an object (m3 hardened for it).
// doctrine_core downward: m3 uses M4's core instead of its own copy (single source, zero drift).
phase('Ingest')
const ingest = await workflow({ scriptPath: M3_PATH }, { ticker: TICKER, as_of: AS_OF, doctrine_core: DOCTRINE_CORE })
if (!ingest || !ingest.datapack_json) throw new Error('Ingest (m3) returned no datapack_json.')

// (2) M1 INPUT = datapack_json + merge of the CAGR seeds from S4 (decision 3A).
//     S1-S6 are already computed (m3 returns streams together with S0), so the post-research
//     seeds are available before the engine computes the P7 scenario table.
const seedMerge = mergeS4CagrSeeds(ingest.datapack_json, ingest.streams)
const m1Input = seedMerge.input
log(`Merge S4 -> M1: ${seedMerge.note}${seedMerge.applied.length ? ' [' + seedMerge.applied.join('; ') + ']' : ''}`)

// (2.5 + 3) XCHECK S0 (GIGO gate, fundamentals REST) in parallel with M1 VALUATION (both cheap
//     sonnets on the same input). An xcheck FAIL aborts BEFORE the writers (opus).
const [xcheck, valuation] = await parallel([
  () => runXcheck(m1Input),
  () => runRunner(m1Input),
])
if (xcheck && xcheck.status === 'FAIL') {
  throw new Error('Xcheck S0 FAIL - datapack_json diverges from the fundamentals REST provider (GIGO gate):\n'
    + String(xcheck.raw || '').slice(-1200))
}
if (!valuation) throw new Error('M1 runner returned no result.')

// (4) CORPUS + SYNTHESIS - in parallel (both from the same bundle, no dependency between them).
//     Pillar-writers write the 8-pillar prose; synthesis writes the 10-field verdict draft (M2's target).
const corpusBundle = {
  ticker: TICKER, as_of: AS_OF, regime: ingest.regime,
  datapack_markdown: ingest.datapack_markdown, datapack_json: m1Input,
  valuation, streams: ingest.streams,
}
const [pillars, synth] = await parallel([
  () => runPillarWriters(corpusBundle),
  () => runSynthesis(corpusBundle),
])
if (!synth) throw new Error('Synthesis returned no result.')

// (5) M2 ADVERSARIAL - on the 10-field draft (verdict audit; the pillar corpus is untouched).
phase('M2 adversarial')
const m2Bundle = {
  ticker: TICKER, as_of: AS_OF, regime: ingest.regime,
  datapack_json: m1Input, valuation, streams: ingest.streams,
}
const m2 = await workflow({ scriptPath: M2_PATH }, {
  draft_markdown: synth.draft_markdown, bundle: m2Bundle, as_of: AS_OF, doctrine_core: DOCTRINE_CORE,
})
if (!m2) throw new Error('M2 returned no result.')

// (6) REVISION - closing sections: Driver/X-check + Recommendation after M2 + Final verdict.
const revisionBundle = { ...m2Bundle, datapack_markdown: ingest.datapack_markdown }
const rev = await runRevision(synth.draft_markdown, synth.verdict_card, m2, revisionBundle)

// (6.5) EDITORIAL - whole-report consistency audit (corpus + closing) + targeted section patches.
// The only stage that sees the stitched report before publication (the writers ran in parallel).
const red = await runRedakcja(
  pillars, rev.closing_markdown, rev.final_verdict_card,
  ingest.regime, valuation, ingest.datapack_markdown
)

// (7) ASSEMBLER - pure JS: frontmatter + corpus (post-editorial prose VERBATIM) + closing.
const finalReport = assembleReport({
  ticker: TICKER, as_of: AS_OF, pillars: red.pillars, closing_markdown: red.closing,
})

// Clean return (the validate_m4.check_return contract). Persistence - the main thread.
return {
  ticker: TICKER,
  as_of: AS_OF,
  regime: ingest.regime,
  source_sufficiency: ingest.source_sufficiency,
  datapack_markdown: ingest.datapack_markdown,
  m1_input: m1Input,
  valuation: valuation,
  streams: ingest.streams,
  pillars: red.pillars,
  draft_markdown: synth.draft_markdown,
  verdict_card: synth.verdict_card,
  m2: m2,
  redakcja: { issues: red.issues, fixed: red.fixed, note: red.note },
  s0_xcheck: xcheck ? { status: xcheck.status, note: xcheck.note } : { status: 'SKIP', note: 'xcheck runner returned no result' },
  m1_seed_merge: { applied: seedMerge.applied, note: seedMerge.note },
  final_report_markdown: finalReport,
  final_verdict_card: rev.final_verdict_card,
  drivers: rev.drivers,
}

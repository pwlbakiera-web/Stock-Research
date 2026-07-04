// M2 - the adversarial pass of the `autonomous-analysis` tool.
//
// A SELF-CONTAINED Workflow script. It attacks the synthesis draft SYMMETRICALLY (3 opus roles/round:
// attack_bull, attack_bear, gate_audit) and audits the 5 doctrine gates. Loop-until-dry, cap 3.
// It does NOT rewrite the draft (that is M4/synthesis) - it returns clean findings + a gate audit.
//
// Workflow sandbox: no imports, no FS, no Date/Math.random. Prompts and schemas INLINE.
// Draft and bundle injected via args (like as_of in M3). Model of all roles: opus.
//
// Run (REQUIRES the user's opt-in to Workflow):
//   Workflow {scriptPath: ".../m2/m2-adversarial.mjs",
//             args: {draft_markdown: <draft.md content>, bundle: <bundle.json object>, as_of:"2026-06-15"}}

export const meta = {
  name: 'autonomous-analysis-m2-adversarial',
  description: 'M2 adversarial pass: 3 opus roles (bull/bear/gate) x loop-until-dry cap 3; findings + audit of the 5 gates',
  phases: [
    { title: 'Round 1', detail: 'attack_bull + attack_bear + gate_audit (opus, parallel)', model: 'opus' },
    { title: 'Round 2', detail: 'another round if round 1 brought new findings', model: 'opus' },
    { title: 'Round 3', detail: 'last round (cap)', model: 'opus' },
  ],
}

// args arrives as a STRING at top-level Workflow; a nested workflow() passes an object - handle both.
// Parsed AT THE TOP, because DOCTRINE_CORE may be overridden by args (a single doctrine source from M4).
const ARGS = typeof args === 'string' ? JSON.parse(args) : (args || {})

// ---------------------------------------------------------------------------
// Doctrine core - pasted into EVERY prompt. SINGLE SOURCE OF TRUTH: M4 passes its
// DOCTRINE_CORE via args.doctrine_core (mirrored in m3) - the local fallback is only
// for m2 runs in isolation.
// ---------------------------------------------------------------------------
const DOCTRINE_FALLBACK = `
OVERRIDING RULES (from DOCTRINE.md - non-negotiable):
- INTEGRITY: never invent numbers. An attack must rest on data from the bundle or a named gap ("no number"). An uncertainty flag != fabrication.
- LEAD WITH THE NUMBER: every charge has a number from the bundle or an explicitly named gap. A bare adjective with no number -> a weak finding.
- THE IMPLIED-VS-ACTUAL GAP is the only anchor. Price level, "how much it rose", the absolute multiple -> noise. Asymmetry = the size of the gap, not the distance from an invented target price.

10 VERDICT FIELDS (the attack surface - check each for consistency and defensibility against the bundle):
1. Edge/variant perception (none -> PASS/WAIT, not BUILD). 2. State of knowledge (certain vs guess). 3. Hypothesis + what must be true + horizon (qualitative conviction). 4. Outside view (base rate + why the exception). 5. Implied vs actual (what growth the price prices in vs the real one). 6. Asymmetry now (upside vs downside). 7. Thesis-breakers. 8. Bet recommendation (tranches or wait + a re-entry trigger). 9. Take-profit condition. 10. Frozen expectation (date).

5 DOCTRINE GATES (audit - for EACH: pass|fail):
1. REGIME named explicitly? (cyclical normalization vs structural TAM expansion) - decides whether normalization is allowed. AI play -> structural BY DEFAULT; mid-cycle as a guess FORBIDDEN.
2. MID-CYCLE used deliberately, not from a reflex? (only after passing gate 1 on the cyclical side with data; never mechanically).
3. TAIL (>2-3 years) as a distribution of scenarios with conviction, NOT a pretext to WAIT? "can't prove 2031" != a reason to wait - it is an entry into the distribution.
4. VERDICT actionable by default? A strong structural signal = tranches NOW. WAIT requires an explicit EV(wait)>EV(act) + a trigger; the reflex "let's wait until management quantifies X / until next quarter" = the FORBIDDEN doctrine error.
5. EDGE named (variant perception)? None -> PASS/WAIT, not BUILD.

STYLE: clear, plain English; en-dash (-) not em-dash; one thought = one sentence; prefer "structural" over "secular".
`.trim()

const DOCTRINE_CORE = ARGS.doctrine_core ? String(ARGS.doctrine_core).trim() : DOCTRINE_FALLBACK

// ---------------------------------------------------------------------------
// Output schemas (inline - sandbox has no imports). FINDING_SCHEMA per spec.
// ---------------------------------------------------------------------------
function findingItem(sideEnum) {
  return {
    type: 'object',
    required: ['side', 'severity', 'claim', 'evidence_or_gap', 'recommended_fix', 'status', 'verdict_impact'],
    properties: {
      side: sideEnum ? { type: 'string', enum: sideEnum } : { type: 'string' },
      severity: { type: 'string', enum: ['high', 'med', 'low'] },
      claim: { type: 'string', description: 'the charge - one sentence' },
      evidence_or_gap: { type: 'string', description: 'evidence from the bundle (number+context) OR a named gap' },
      recommended_fix: { type: 'string', description: 'what the synthesis should fix' },
      status: { type: 'string', enum: ['resolved', 'unresolved'] },
      verdict_impact: { type: 'boolean', description: 'does the charge move the verdict/conviction' },
    },
  }
}

const ROUND_SCHEMA = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: { type: 'array', items: findingItem(null) },
  },
}

const GATE_SCHEMA = {
  type: 'object',
  required: ['gate_audit', 'findings'],
  properties: {
    gate_audit: {
      type: 'object',
      required: ['gate_1', 'gate_2', 'gate_3', 'gate_4', 'gate_5'],
      properties: {
        gate_1: { type: 'object', required: ['verdict'], properties: { verdict: { type: 'string', enum: ['pass', 'fail'] }, note: { type: 'string' } } },
        gate_2: { type: 'object', required: ['verdict'], properties: { verdict: { type: 'string', enum: ['pass', 'fail'] }, note: { type: 'string' } } },
        gate_3: { type: 'object', required: ['verdict'], properties: { verdict: { type: 'string', enum: ['pass', 'fail'] }, note: { type: 'string' } } },
        gate_4: { type: 'object', required: ['verdict'], properties: { verdict: { type: 'string', enum: ['pass', 'fail'] }, note: { type: 'string' } } },
        gate_5: { type: 'object', required: ['verdict'], properties: { verdict: { type: 'string', enum: ['pass', 'fail'] }, note: { type: 'string' } } },
      },
    },
    findings: { type: 'array', items: findingItem(['gate_1', 'gate_2', 'gate_3', 'gate_4', 'gate_5']) },
  },
}

// ---------------------------------------------------------------------------
// Shared prompt context: draft + bundle (JSON) + the "already found" list.
// ---------------------------------------------------------------------------
function contextBlock(draftMd, bundle, seen) {
  const seenLines = seen.length
    ? seen.map((f) => `- [${f.side}] ${f.claim}`).join('\n')
    : '(empty - this is the first round)'
  return `
=== SYNTHESIS DRAFT (the attack target - prose, 10 verdict fields) ===
${draftMd}

=== BUNDLE (hard data to confront it with - regime + datapack + valuation result + streams S1-S6) ===
${JSON.stringify(bundle, null, 2)}

=== ALREADY FOUND (do NOT repeat - look for NEW holes) ===
${seenLines}
`.trim()
}

function bullPrompt(draftMd, bundle, seen) {
  return `
You are ATTACK_BULL - the adversary of the long thesis. Model: opus. MANDATE: assume the long thesis (BUILD/BUY) is WRONG and tear it apart.
Look for: overstated growth, ignored risk, optimistic valuation assumptions, a weak/unnamed edge, a growth lever that is exo (a bet on the cycle, not the company). Confront the draft's claims with the bundle (S3 risks, S4 exo levers, the valuation result vs implied).

${DOCTRINE_CORE}

${contextBlock(draftMd, bundle, seen)}

Return ONLY the object {findings:[...]}. Each finding: side="bull", severity, claim (one sentence), evidence_or_gap (a number from the bundle OR a named gap), recommended_fix, status (resolved when the bundle settles it, unresolved when it stays open), verdict_impact (bool). Lead with the number. Do not invent - flag the gap.
`.trim()
}

function bearPrompt(draftMd, bundle, seen) {
  return `
You are ATTACK_BEAR - the adversary of the "wait/it will fall" thesis. Model: opus. MANDATE: assume the WAIT/PASS thesis is WRONG and tear it apart.
Look for: an understated TAM, missed levers (S4), mid-cycle applied from a reflex instead of after passing the regime gate, the tail used as a pretext to WAIT (gate 3), a verdict that breaks the "default actionable" doctrine (a strong structural signal -> tranches now, not waiting until management quantifies another metric). Confront it with the bundle: is regime=structural, what demand signals do the streams show (e.g. book-to-bill, orders, backlog, retention - WHATEVER is in THIS company's bundle).

${DOCTRINE_CORE}

${contextBlock(draftMd, bundle, seen)}

Return ONLY the object {findings:[...]}. Each finding: side="bear", severity, claim, evidence_or_gap, recommended_fix, status, verdict_impact. Lead with the number. Do not invent - flag the gap.
`.trim()
}

function gatePrompt(draftMd, bundle, seen) {
  return `
You are GATE_AUDIT - the auditor of the 5 doctrine gates. Model: opus. MANDATE: for EACH of the 5 gates decide whether the draft passed (pass) or broke it (fail), and on a fail issue a finding.

${DOCTRINE_CORE}

${contextBlock(draftMd, bundle, seen)}

For each gate 1-5 compare the draft with the bundle (especially regime.call and the valuation result):
- Gate 1 (regime named explicitly and consistently?): does the draft name the regime and use it CONSISTENTLY? (e.g. field 1 says structural, but field 6 normalizes cyclically = inconsistency = fail).
- Gate 2 (mid-cycle deliberate?): is the mid-cycle haircut justified by passing the gate, or applied reflexively despite regime=structural?
- Gate 3 (tail as a distribution, not WAIT?): is "can't prove the 2031-2035 tail" used as a reason to wait (fail) or as an entry into the distribution (pass)?
- Gate 4 (verdict actionable?): first check IN THIS company's BUNDLE whether there is a strong structural signal (e.g. book-to-bill, order momentum, backlog, retention); if there is - is the verdict tranches, or the reflex "let's wait until management quantifies X" (fail)? Also check the CONSISTENCY of the verdict card with the corpus (field 8).
- Gate 5 (edge named?): is the variant perception named and provable?

Return ONLY the object {gate_audit:{gate_1..gate_5:{verdict,note}}, findings:[...]}. Each finding (only for failed gates): side = the exact failed-gate name ("gate_1" / "gate_2" / "gate_3" / "gate_4" / "gate_5", NOT literally "gate_N"), severity, claim, evidence_or_gap, recommended_fix, status, verdict_impact. Lead with the number.
`.trim()
}

// ---------------------------------------------------------------------------
// Dedup: key = side + a normalized shorthand of the charge (lowercase, first ~6 words).
// The same charge from two rounds counts once. A backstop - the prompts also get "seen".
// ---------------------------------------------------------------------------
function dedupKey(f) {
  const claim = (f && f.claim ? String(f.claim) : '').toLowerCase()
  const norm = claim.replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean).slice(0, 6).join(' ')
  return `${f && f.side}|${norm}`
}

// ---------------------------------------------------------------------------
// Body: input via args; loop 3 roles/round; merge+dedup; stop dry|cap.
// ---------------------------------------------------------------------------
// ARGS parsed at the top of the file (before DOCTRINE_CORE).
const DRAFT = ARGS.draft_markdown || ''
const BUNDLE = ARGS.bundle || {}
const TICKER = BUNDLE.ticker || ARGS.ticker || 'TICKER'
const AS_OF = BUNDLE.as_of || ARGS.as_of || ''
if (!DRAFT) throw new Error('M2: no draft_markdown in args - nothing to attack.')

const seen = []
const seenKeys = new Set()
let lastGateAudit = {}
let roundsRun = 0
let stoppedReason = 'cap'

for (let r = 1; r <= 3; r++) {
  roundsRun = r
  const phaseLabel = `Round ${r}`
  phase(phaseLabel)
  log(`${phaseLabel}: 3 opus roles (bull/bear/gate), seen=${seen.length}`)
  const [bull, bear, gates] = await parallel([
    () => agent(bullPrompt(DRAFT, BUNDLE, seen), { label: `bull:r${r}`, phase: phaseLabel, model: 'opus', schema: ROUND_SCHEMA }),
    () => agent(bearPrompt(DRAFT, BUNDLE, seen), { label: `bear:r${r}`, phase: phaseLabel, model: 'opus', schema: ROUND_SCHEMA }),
    () => agent(gatePrompt(DRAFT, BUNDLE, seen), { label: `gate:r${r}`, phase: phaseLabel, model: 'opus', schema: GATE_SCHEMA }),
  ])

  if (gates && gates.gate_audit) lastGateAudit = gates.gate_audit

  const roundFindings = [
    ...((bull && bull.findings) || []),
    ...((bear && bear.findings) || []),
    ...((gates && gates.findings) || []),
  ]
  const fresh = roundFindings.filter((f) => {
    const k = dedupKey(f)
    if (seenKeys.has(k)) return false
    seenKeys.add(k)
    return true
  })
  log(`${phaseLabel}: ${roundFindings.length} findings, ${fresh.length} new after dedup`)

  if (fresh.length === 0) { stoppedReason = 'dry'; break }
  seen.push(...fresh)
}

const hasBull = seen.some((f) => f.side === 'bull')
const hasBear = seen.some((f) => f.side === 'bear')
const unresolved = seen.filter((f) => f.status === 'unresolved')

log(`M2 end: rounds=${roundsRun}, stop=${stoppedReason}, findings=${seen.length}, symmetry=${hasBull && hasBear}, unresolved=${unresolved.length}`)

return {
  ticker: TICKER,
  as_of: AS_OF,
  rounds_run: roundsRun,
  stopped_reason: stoppedReason,
  findings: seen,
  gate_audit: lastGateAudit,
  symmetry_ok: hasBull && hasBear,
  unresolved,
}

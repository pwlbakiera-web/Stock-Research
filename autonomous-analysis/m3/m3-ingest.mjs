// M3 - the ingest layer of the `autonomous-analysis` tool (S0 + fan-out S1-S6).
//
// A SELF-CONTAINED Workflow script covering ONLY the ingest:
//   1) S0 (opus, sequential) -> a verified data pack (markdown A-K) + JSON inputs for M1 + the regime call,
//   2) S1-S6 (sonnet, in parallel) -> structured findings per pillar, each fed the data pack + a narrow brief.
//
// It does NOT contain M1 (valuation), M2 (adversarial pass) or synthesis - deliberately. The "assembly" step (M4)
// composes this ingest with the rest via workflow({scriptPath}) as a sub-step (one level of nesting - allowed).
// So this file can be run in isolation to validate the ingest alone without a full run.
//
// Workflow sandbox: no imports, no FS, no Date/Math.random. So prompts and schemas are INLINE,
// and as_of is injected via args (the script does not know "today"). Models: S0=opus, S1-S6=sonnet.
//
// Run (ingest for one ticker):
//   Workflow {scriptPath: ".../m3/m3-ingest.mjs", args: {ticker:"TICKER", as_of:"2026-06-15"}}

export const meta = {
  name: 'autonomous-analysis-m3-ingest',
  description: 'M3 ingest: S0 data-pack/event-backbone (opus) then parallel S1-S6 research streams (sonnet)',
  phases: [
    { title: 'S0 data pack', detail: 'opus: autonomous data pack + M1 inputs + regime', model: 'opus' },
    { title: 'Fan-out S1-S6', detail: 'sonnet x6 in parallel: pillars 1-3,5,5.5,6,8', model: 'sonnet' },
  ],
}

// args arrives as a STRING at top-level Workflow; a nested workflow() passes an object - handle both.
// Parsed AT THE TOP, because DOCTRINE_CORE may be overridden by args (a single doctrine source from M4).
const ARGS = typeof args === 'string' ? JSON.parse(args) : (args || {})

// ---------------------------------------------------------------------------
// Doctrine core - pasted into EVERY prompt. SINGLE SOURCE OF TRUTH: M4 passes its
// DOCTRINE_CORE via args.doctrine_core (mirrored in m2) - the local fallback is only
// for m3 runs in isolation. The ingest addendum (research method) is always appended.
// ---------------------------------------------------------------------------
const M3_ADDENDUM = `
RESEARCH METHOD (replaces deep-research): fan-out web (WebSearch + serper_search + jina_read via ToolSearch) +
adversarial self-verification of every claim (try to refute it before you record it). Link the specific article, not the domain.
`.trim()

const DOCTRINE_FALLBACK = `
OVERRIDING RULES (from DOCTRINE.md - non-negotiable):
- DATA INTEGRITY: never invent numbers. Every number has a SOURCE (a filing/IR/web URL with attribution)
  or is explicitly flagged "est." (to confirm). No number -> flag it, do NOT guess. An uncertainty flag != fabrication.
- LEAD WITH THE NUMBER: every evaluative sentence has a number and a variance vs expectations. A bare adjective with no number -> cut it.
- REGIME GATE (before any normalization): settle cyclical normalization vs structural TAM expansion.
  An AI play -> structural expansion BY DEFAULT; dependence on the AI capex cycle only named as a thesis-breaker.
  Mid-cycle normalization FORBIDDEN as a guess - only after a deliberate pass of the gate on the cyclical side with data.
- FALSE-PRECISION TAX: every number from a 5+ year horizon (CAGR, margin, FCF) is a scenario artifact, not a measurement - flag it.
- THE TAIL (>2-3 years) = a distribution of scenarios with qualitative conviction (high/medium/low), NOT a proof, NOT a WAIT trigger.
STYLE: clear, plain English; en-dash (-) not em-dash; one thought = one sentence; prefer "structural"/"durable" over "secular";
  clean Markdown (Google Docs export); bold sparingly; on an estimate change show old -> new.
`.trim()

const DOCTRINE_CORE = ((ARGS.doctrine_core ? String(ARGS.doctrine_core).trim() : DOCTRINE_FALLBACK) + '\n\n' + M3_ADDENDUM).trim()

// ---------------------------------------------------------------------------
// S0 - data pack / event-backbone (opus, sequential, first)
// ---------------------------------------------------------------------------
function s0Prompt(ticker, asOf) {
  const asOfLine = asOf
    ? `Reference date (as_of) for prices/multiples: ${asOf}. Use it as the "state as of date" anchor.`
    : `No imposed date - use the freshest available data and record the actual read date as as_of.`
  return `
You are S0 - the data-acquisition agent for the autonomous analysis of the company ${ticker}. Model: opus (number integrity = the foundation, GIGO).

AUTONOMY CONTRACT: full autonomy, zero questions to the user. You acquire data best-effort from the open web.
Uncertainty does NOT stop the work - it lands as an explicit "est." flag next to the number. The hard "NEVER invent" rule holds.

${asOfLine}

${DOCTRINE_CORE}

=== SOURCE PLAYBOOK ===
First load the tools via ToolSearch: WebSearch, mcp__research__serper_search, mcp__research__jina_read, WebFetch.

0. A fundamentals provider (PRIMARY SOURCE - clean, structured fundamentals; USE FIRST): if you have a fundamentals API (e.g. fiscal.ai) load its tools via ToolSearch and prefer them for HARD NUMBERS (income/balance/cashflow standardized, ratios, shares-outstanding, estimates/segments-and-kpis, insider/institutional, company/profile). Company keys are usually formatted EXCHANGE_TICKER (e.g. NASDAQ_MSFT). REBRAND RESILIENCE: if a company_profile returns "not found", do NOT immediately fall back to the web - use a companies-list endpoint and find the right company key by the company NAME (the ticker may have changed). If the provider's MCP is unavailable in a given run, use REST: GET https://<provider>/v1/<endpoint>?companyKey=NASDAQ_<TICKER>&apiKey=<key from an env var such as FISCAL_AI_API_KEY>. Only once the provider does not cover a given number -> EDGAR/transcripts/open web below. Every number still carries a source marker.

1. SEC EDGAR (primary source - 10-K + the latest 10-Q + material 8-Ks):
   - Ticker -> CIK: https://www.sec.gov/files/company_tickers.json (a ticker->CIK map) or full-text search.
   - Company submissions: https://data.sec.gov/submissions/CIK##########.json (CIK zero-padded to 10 digits).
   - Full-text filing search: https://efts.sec.gov/LATEST/search-index?q=%22${ticker}%22&forms=10-K
   - Pull the content via jina_read / WebFetch on the filing URL. Extract: revenue/margins/EPS (3-5 years), FCF/CFO/CapEx,
     debt/cash/net debt, diluted shares, segments, RPO/backlog, risks, geography, taxes.
2. EARNINGS CALL TRANSCRIPTS (>=3 most recent earnings calls; count M&A calls separately):
   - serper_search: "${ticker} earnings call transcript" + the quarter names; sources: transcript sites,
     Seeking Alpha, company IR. jina_read for the full text. Inventory what you have (date + type: earnings vs M&A vs conference).
3. MARKET / CONSENSUS / MULTIPLES (WebSearch + serper):
   - a market-data site (statistics, forecast, financials): price, market cap, EV, fwd P/E, EV/EBITDA,
     EV/Sales, P/FCF, FCF yield, ROIC, short interest, net debt, shares, beta, dividend.
   - Forward consensus: FY1 and FY2 revenue, adj EPS, FCF (avg + range if available), 3Y EPS CAGR.
   - Analyst targets (as SENTIMENT, not a valuation anchor), the revision direction, insider activity.

=== WHAT TO COMPUTE IN THE DATA PACK (Pillar 4 distributed - compute the trends here) ===
- 3-year CAGR of revenue/margin/FCF; is the last quarter in-trend or a change (acceleration/deceleration).
- ROIC (and direction), net leverage (net debt/EBITDA), interest coverage, FCF margin, earnings quality (FCF vs NI, SBC).
- base_fcf_ttm = FCF TTM (SBC-adjusted where possible); ttm_revenue; ebitda_ttm.

=== REGIME GATE (Step 0) ===
Name the regime explicitly: "cyclical normalization" or "structural TAM expansion" + a 2-3 sentence rationale.
An AI play -> structural by default. This field steers the whole later valuation - it must be deliberate.

=== OUTPUT 1: datapack_markdown (string) ===
A full data pack in the A-K structure:
A. Market data | B. Valuation multiples | C. Last quarter (headline, beat/miss, segments, end-markets, one-offs)
D. Guidance | E. Forward consensus | F. Multi-year financials + earnings quality + balance sheet | G. Acquisitions/events
H. Sentiment and management | I. Competition/moat (sketch) | J. Material news (catalyst backbone) | K. Themes and quotes from the calls
+ a "Sources" section with a list [S1]..[Sn] (specific URLs) + a "Gaps / unverified" section.
Every number: an inline source marker [S#] or "est." / "NOT VERIFIED". This is the file for _sources/.

=== OUTPUT 2: datapack_json (object = the JSON INPUTS for the M1 engine) ===
FACTUAL fields (hard, sourced - accuracy matters here):
  ticker, as_of, currency, unit ("mln USD" - all amounts in mln of the currency),
  price, shares_diluted (mln), net_debt (mln), enterprise_value (mln), market_cap (mln),
  base_fcf_ttm (mln), ttm_revenue (mln), ebitda_ttm (mln),
  consensus: { fcf:{FY2026:..,FY2027:..}, revenue:{...}, eps_adj:{...}, eps_cagr_3y:0.xx },
  valuation_multiples: { fwd_pe, ev_ebitda, fcf_yield_ttm },
  fcf_margin (TTM, a fraction), net_dilution (annual, a fraction; default ~0.01 if no data - flag it).
SCENARIO-ASSUMPTION fields (doctrine defaults; EVERY 5y+ number is a scenario artifact - flag it; M4 may overwrite them with S3/S4 data):
  wacc_anchor (default 0.10), wacc_sensitivity (e.g. [0.09,0.095,0.10] +/- sector adjustment), terminal_growth (default 0.03), explicit_years (10),
  interconnect_market_size: { value: <sector TAM in mln, est.>, flag: "est. ..." }  // NOTE: M1 reads EXACTLY this key as the sector-TAM proxy regardless of industry,
  price_ladder: [a few prices around the current one -> implied CAGR],
  midcycle: { current_op_margin, midcycle_op_margin, fcf_haircut (a fraction), flag },
  scenarios: [ 4 scenarios bear->supercycle; each {name, type, conviction(+rationale in the name)} where
     type="flat" -> add "cagr"; type="front_tail" -> add "front":[5 values] and "tail":[5 values] (sum of 10 = explicit_years) ],
  front_tail_study: { front:[5], tails:[ {name, tail:[5]}, ... ] },
  future_multiple_check: { target_eps: <consensus FY2 adj EPS>, target_year_label, years_out, mature_pe (from a multiple<->growth calibration table), discount_rate, net_cash_build_per_share }.
     // net_cash_build_per_share MUST be a NUMBER (USD/share; M1 reads it as a scalar). Uncertain -> give a best-estimate number, put the comment in a separate net_cash_build_per_share_flag; unknown -> OMIT the field (M1 defaults to 0).
Derive the scenario seeds from: the implied CAGR at the current price, the FY1/FY2 consensus, the regime and the mid-cycle margin. These are starting points, not truths.

=== OUTPUT 3: regime (object) ===
{ call: "cyclical normalization" | "structural TAM expansion", rationale: "..." }

=== OUTPUT 4: source_sufficiency (object) - downgrade when data is thin ===
Core = 10-K + >=3 transcripts + consensus. { ok: bool, have:[...], missing:[...], conviction_note:"..." }.
When the core is missing -> ok:false, list what's missing, note the lowered conviction. NEVER fill gaps with invented numbers.

Return ONLY a structured object matching the schema (datapack_markdown, datapack_json, regime, source_sufficiency).
`.trim()
}

const M1_INPUT_SCHEMA = {
  type: 'object',
  required: [
    'ticker', 'as_of', 'currency', 'unit', 'price', 'shares_diluted', 'net_debt',
    'enterprise_value', 'market_cap', 'base_fcf_ttm', 'ttm_revenue', 'ebitda_ttm',
    'wacc_anchor', 'wacc_sensitivity', 'terminal_growth', 'explicit_years',
    'fcf_margin', 'net_dilution', 'consensus', 'valuation_multiples',
    'interconnect_market_size', 'midcycle', 'price_ladder', 'scenarios',
    'front_tail_study', 'future_multiple_check',
  ],
  properties: {
    ticker: { type: 'string' }, as_of: { type: 'string' },
    currency: { type: 'string' }, unit: { type: 'string' },
    price: { type: 'number' }, shares_diluted: { type: 'number' },
    net_debt: { type: 'number' }, enterprise_value: { type: 'number' },
    market_cap: { type: 'number' }, base_fcf_ttm: { type: 'number' },
    ttm_revenue: { type: 'number' }, ebitda_ttm: { type: 'number' },
    wacc_anchor: { type: 'number' },
    wacc_sensitivity: { type: 'array', items: { type: 'number' } },
    terminal_growth: { type: 'number' }, explicit_years: { type: 'integer' },
    fcf_margin: { type: 'number' }, fcf_margin_alt: { type: 'number' },
    net_dilution: { type: 'number' },
    consensus: {
      type: 'object',
      required: ['fcf', 'revenue', 'eps_adj', 'eps_cagr_3y'],
      properties: {
        fcf: { type: 'object' }, revenue: { type: 'object' },
        eps_adj: { type: 'object' }, eps_cagr_3y: { type: 'number' },
      },
    },
    valuation_multiples: {
      type: 'object',
      required: ['fwd_pe', 'ev_ebitda', 'fcf_yield_ttm'],
      properties: {
        fwd_pe: { type: 'number' }, ev_ebitda: { type: 'number' },
        fcf_yield_ttm: { type: 'number' },
      },
    },
    interconnect_market_size: {
      type: 'object', required: ['value', 'flag'],
      properties: { value: { type: 'number' }, flag: { type: 'string' } },
    },
    midcycle: {
      type: 'object',
      required: ['current_op_margin', 'midcycle_op_margin', 'fcf_haircut', 'flag'],
      properties: {
        current_op_margin: { type: 'number' }, midcycle_op_margin: { type: 'number' },
        fcf_haircut: { type: 'number' }, flag: { type: 'string' },
      },
    },
    price_ladder: { type: 'array', items: { type: 'number' } },
    scenarios: {
      type: 'array',
      items: { type: 'object', required: ['name', 'type', 'conviction'] },
    },
    front_tail_study: {
      type: 'object', required: ['front', 'tails'],
      properties: {
        front: { type: 'array', items: { type: 'number' } },
        tails: { type: 'array', items: { type: 'object' } },
      },
    },
    future_multiple_check: {
      type: 'object',
      required: ['target_eps', 'years_out', 'mature_pe', 'discount_rate'],
      properties: {
        // M1 reads it as a scalar (dcf.future_multiple_cash_bridge); a STRING flag = crash. Force a number.
        net_cash_build_per_share: { type: 'number' },
      },
    },
  },
}

const S0_SCHEMA = {
  type: 'object',
  required: ['datapack_markdown', 'datapack_json', 'regime', 'source_sufficiency'],
  properties: {
    datapack_markdown: { type: 'string', description: 'Full data pack A-K + Sources + Gaps (the file for _sources/).' },
    datapack_json: M1_INPUT_SCHEMA,
    regime: {
      type: 'object', required: ['call', 'rationale'],
      properties: {
        call: { type: 'string', enum: ['cyclical normalization', 'structural TAM expansion'] },
        rationale: { type: 'string' },
      },
    },
    source_sufficiency: {
      type: 'object', required: ['ok', 'have', 'missing', 'conviction_note'],
      properties: {
        ok: { type: 'boolean' },
        have: { type: 'array', items: { type: 'string' } },
        missing: { type: 'array', items: { type: 'string' } },
        conviction_note: { type: 'string' },
      },
    },
  },
}

// ---------------------------------------------------------------------------
// S1-S6 - research streams (sonnet, in parallel; each: data pack + a narrow brief)
// A mirror of the manual analysis process (one stream per pillar).
// ---------------------------------------------------------------------------
const STREAMS = [
  {
    key: 'S1', title: 'Operational + Technology deep-dive (Pillar 1)',
    brief: `
Pillar 1 (Deep Dive Operational) + technology grounding for the LAYPERSON.
- Business mechanics in one paragraph; revenue breakdown per segment; unit economics (profitability of a single transaction/customer).
- Who buys (B2B/B2C, enterprise/SMB, recognizable names); purchase frequency (one-off vs recurring); pricing power (can they raise prices, what limits it, has it changed); recession resilience (mission-critical vs discretionary).
- Use the Pillar 4 trends computed in the data pack (ROIC/margins/FCF) as background.
- TECHNOLOGY SECTION: explain the technology/value chain so a lay investor understands - from intuition to the physics/specifics. Where the company sits in the chain and why it is changing (the field is shifting).`,
  },
  {
    key: 'S2', title: 'Moat (Pillar 2)',
    brief: `
Pillar 2 (Moat). Five sources (Dorsey + Helmer): network effect (with a reach test local vs global + cross-side), switching costs, low-cost production, intangibles (patents/brand/licenses), counterpositioning.
- State: wide / narrow / none. DIRECTION (more important): widening / stable / shrinking.
- Rule: a narrow-and-widening moat > a wide-and-shrinking one. The direction co-varies with the price, not the absolute width.
- For every moat claim give a numeric proof (e.g. retention, share, price premium) or flag the gap.`,
  },
  {
    key: 'S3', title: 'Execution risk (Pillar 3)',
    brief: `
Pillar 3 (Execution Risk).
- Concentration: dependence on a narrow customer group; red flag: one customer >20% of revenue; is the mix diversifying.
- Disruption: disrupted vs disruptor; direction matters more than state.
- External forces: regulation, commodities, rates, macro/politics, export controls (e.g. China/tariffs).
- Competition: players + potential entrants + substitutes; attack on margin (dangerous short-term) vs on volume (dangerous long-term).
- Technology risk: long-term scenarios + early warning signals to monitor.
ADDITIONAL OUTPUT: thesis_breakers (concrete signals that break the thesis) + driver_tags (neutral variables: e.g. AI capex, commodity prices; {id, dir:+/-, sens:high/med/low}).`,
  },
  {
    key: 'S4', title: 'Growth + TAM + Lever Bridge (Pillar 5 + 5.5)',
    brief: `
Pillar 5 (Growth) + 5.5 (Lever Bridge) - the second valuation engine; FEEDS the M1 scenario assumptions.
- TAM/SAM: market size, current penetration, where the ceiling is (saturated or being built). Give a market number (or est.) - this feeds the scale sanity-check in M1.
- Growth levers: new customers, more from existing (cross/upsell, new locations), geography, new products/second TAM, pricing, M&A. S&M as % of revenue (organic vs bought). Backlog (product vs service). Catalysts.
- LEVER BRIDGE: line up the levers marching current -> implied target (revenue -> margin -> EBITDA). Tag each lever: endo (management controls) / partial / exo (the market/cycle controls). If most of the swing is in exo/partial -> the thesis is a bet on the cycle, not the company - say it outright.
- Credibility test per endo lever: what metric proves delivery + what tension/constraint.
ADDITIONAL OUTPUT: driver_tags (exo levers as drivers) + cagr_seed = {bear, base, bull, flag}:
recommended FCF CAGR (FRACTIONS, e.g. 0.04 = 4%; ~10-year horizon) for the valuation scenarios,
derived from TAM/levers/backlog AFTER research; flag = a one-sentence rationale. This is a scenario
artifact (not a measurement) - M4 folds it deterministically into the engine's scenario seeds.`,
  },
  {
    key: 'S5', title: 'Outlook + narrative-evolution (Pillar 6)',
    brief: `
Pillar 6 (Outlook) - FULL extraction of material signals from management communication, NOT just the narrative evolution.
Ingest ALL available transcripts/shareholder letters/presentations (from the data pack + pull missing ones from the web); mark each one's type (earnings vs M&A vs conference) and date.

A) EXTRACTING HARD SIGNALS (each -> a finding: claim + evidence + source + interpretation + severity):
- Management outlook / guidance: revenue/margin/EPS/FCF/capex forecasts; the assumptions under them; guidance changes vs the prior quarter (raised / cut / withdrawn).
- Market/industry forecasts cited by management: TAM, segment growth rate, customer capex, prices - ALWAYS with attribution of who forecasts.
- Factors REINFORCING the thesis (-> growth): new markets/products/segments, new growth drivers, design wins, backlog, margin expansion - what raises the ceiling.
- Factors REFUTING the thesis (-> thesis-breaker): threats, cycle/competition/regulation risks, softening demand, cost pressure, customer concentration - what breaks the thesis.

B) NARRATIVE ANALYSIS OVER TIME (>=3 calls, 6 lenses per call): (1) hedging language, (2) dodged/unanswered questions, (3) language changes vs the prior quarter (new buzzwords / dropped themes), (4) what was NOT said, (5) signals hidden in a positive narrative, (6) unexpected admissions of risk. Per lens: quote -> interpretation -> severity. Extract ONE narrative crux (how management's main thesis evolved; where it confirms, where it creeps).

OUTPUT ROUTING: signals that break the thesis -> thesis_breakers[]; neutral variables steering the thesis (e.g. AI capex, commodity prices, cycle) -> driver_tags[] {id, dir:+/-, sens}; the rest of the material -> findings[]. Rule: anything that can move a thesis-breaker OR the growth path must reach the output.`,
  },
  {
    key: 'S6', title: 'Sentiment / management (Pillar 8)',
    brief: `
Pillar 8 (Sentiment + Management).
- Sentiment: bulls vs bears (current narratives); analyst consensus (targets = SENTIMENT and the revision direction, NEVER a valuation anchor - that is circular reasoning); insider trading (scale, timing, open-market buys); short interest (% float, trend); momentum vs sector/market (underperformance on good fundamentals = a potential opportunity).
- Management: track record (tenure, what they built/destroyed, founder vs hired CEO); execution vs promises (qualitatively); shareholder friendliness (SBC as % of FCF, capital allocation, buybacks); Glassdoor (rating + trend); skin in the game (shares held, open-market buys).`,
  },
]

const STREAM_SCHEMA = {
  type: 'object',
  required: ['stream', 'summary', 'findings', 'open_gaps'],
  properties: {
    stream: { type: 'string' },
    summary: { type: 'string', description: 'Pillar summary: what is strong, what raises questions, what needs more work. Lead with the number.' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['claim', 'evidence', 'interpretation'],
        properties: {
          claim: { type: 'string' },
          evidence: { type: 'string', description: 'number(s) + context; or "est." when unverified' },
          source: { type: 'string', description: 'URL of a specific article/filing or "none/est."' },
          interpretation: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'med', 'high'] },
        },
      },
    },
    open_gaps: { type: 'array', items: { type: 'string' }, description: 'what could not be verified' },
    driver_tags: {
      type: 'array',
      description: 'mainly S3/S4/S5: neutral variables steering the thesis',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, dir: { type: 'string' }, sens: { type: 'string' } },
      },
    },
    thesis_breakers: { type: 'array', items: { type: 'string' }, description: 'mainly S3/S5: signals that break the thesis' },
    cagr_seed: {
      type: 'object',
      description: 'S4 ONLY: recommended FCF CAGR (fractions) for the valuation scenarios after research; a scenario artifact, not a measurement. M4 folds it deterministically into the M1 seeds.',
      properties: {
        bear: { type: 'number' }, base: { type: 'number' }, bull: { type: 'number' },
        flag: { type: 'string', description: 'one sentence: where these numbers come from (TAM/levers/backlog)' },
      },
    },
  },
}

function streamPrompt(stream, ticker, dataPackMd) {
  return `
You are ${stream.key} - a research stream for the autonomous analysis of the company ${ticker}. Model: sonnet.
You reproduce the analysis method for your scope. You work on the provided DATA PACK; missing facts
you pull with your own web fan-out (WebSearch + serper_search + jina_read via ToolSearch) and adversarially verify.

${DOCTRINE_CORE}

=== YOUR SCOPE: ${stream.title} ===
${stream.brief.trim()}

=== DATA PACK (input from S0 - verified numbers with sources) ===
${dataPackMd}

Return ONLY a structured object matching the schema (stream, summary, findings[], open_gaps[], optionally driver_tags[], thesis_breakers[]).
Each finding: claim + evidence(number/est.) + source(URL) + interpretation + severity. Lead with the number. Do not invent - flag it.
`.trim()
}

// ---------------------------------------------------------------------------
// Body: S0 sequential -> barrier -> S1-S6 in parallel.
// (parallel = the barrier is CORRECT: the next step, synthesis, needs ALL streams together.)
// ---------------------------------------------------------------------------
// ARGS parsed at the top of the file (before DOCTRINE_CORE).
const TICKER = (ARGS && ARGS.ticker) || 'TICKER'
const AS_OF = (ARGS && ARGS.as_of) || '' // sandbox has no Date - as_of injected via args

phase('S0 data pack')
log(`S0 start: ${TICKER}${AS_OF ? ' @ ' + AS_OF : ''}`)
const s0 = await agent(s0Prompt(TICKER, AS_OF), {
  label: `S0:${TICKER}`, phase: 'S0 data pack', model: 'opus', schema: S0_SCHEMA,
})
if (!s0) throw new Error('S0 returned no result - ingest aborted (no data pack = no foundation).')
log(`S0 done: regime="${s0.regime && s0.regime.call}", sources_ok=${s0.source_sufficiency && s0.source_sufficiency.ok}`)

phase('Fan-out S1-S6')
const streamResults = await parallel(
  STREAMS.map((s) => () =>
    agent(streamPrompt(s, TICKER, s0.datapack_markdown), {
      label: `${s.key}:${TICKER}`, phase: 'Fan-out S1-S6', model: 'sonnet', schema: STREAM_SCHEMA,
    })
  )
)
const streams = {}
STREAMS.forEach((s, i) => { streams[s.key] = streamResults[i] })
const ok = STREAMS.filter((s, i) => streamResults[i]).length
log(`Fan-out done: ${ok}/${STREAMS.length} streams returned a result`)

// Ingest return - the input for M4 (assembly): datapack_json -> M1, the rest -> synthesis.
return {
  ticker: TICKER,
  as_of: AS_OF,
  regime: s0.regime,
  source_sufficiency: s0.source_sufficiency,
  datapack_markdown: s0.datapack_markdown,
  datapack_json: s0.datapack_json,
  streams,
}

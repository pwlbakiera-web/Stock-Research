---
name: analyze-stock
description: Use when user wants to analyze a stock or company for investment purposes, start a new company analysis, continue an existing analysis, or asks to go through any analytical pillar or step of the investment framework.
---

# Analyze Stock — Investment Analysis Framework

## Overview

Structured 8-step investment analysis (plus a synthesis bridge and a bet-recommendation step). User drives pace — work in small steps, await approval before moving to next. Generate questions dynamically from principles, never from a closed list. Cite sources with specific article links, not domains.

**Default: always verify time-sensitive facts via WebSearch.** Training data has a cutoff — company leadership, recent results, market share, guidance, and competitive dynamics must be checked against current sources. When in doubt, search first, answer second.

This is the manual, conversational twin of `autonomous-analysis/` (see that folder for the automated pipeline version of the same framework).

## Invocation

```
/analyze-stock [Company]           ← new analysis or continue existing
/analyze-stock [Company] update    ← earnings update / thesis review
```

**New analysis / continue:** If company folder exists, read `CLAUDE.md` first to see current state and continue from where we left off. Otherwise start from Step 0.

**Update mode:** Triggered by `update` argument or when user says "update [Company]", "new results". See Update Mode section below.

## Structure

```
Step 0:     Classification
Pillar 1:   Deep Dive Operational
Pillar 2:   Moat
Pillar 3:   Execution Risk
Pillar 4:   Financial Analysis
Pillar 5:   Growth Potential
Pillar 5.5: Promise Check / Lever Bridge
Pillar 6:   Outlook
Pillar 7:   Valuation
Pillar 8:   Sentiment + Management Assessment
```

At the end of each pillar: short qualitative summary — what's strong, what raises questions, what needs further investigation.

**Bet language (BUY/WAIT/PASS/tranches/starter position) belongs exclusively in the final Bet Recommendation step.** Individual pillar summaries name tensions and strengths — they don't issue pre-verdicts. Mixing partial verdicts across pillars produces contradictory signals by the end of the report.

## Step 0: Classification

Assign each segment to Phase 1-6. Build composite for the whole group.

| Phase | Key question | Valuation method |
|---|---|---|
| 1 Startup | PMF? | EV/SAM |
| 2 Hyper Growth | Sustainable? | EV/Sales |
| 3 Self Funding | Can we scale? | EV/Gross Profit |
| 4 Operating Leverage | Max profits? | Forward PE / P/FCF |
| 5 Capital Return | Reward investors? | PE / EV/EBITDA |
| 6 Decline | Turn around? | P/B / liquidation |

**Lynch modifier** (only when Phase alone doesn't describe the dynamics):
- **Cyclical** → resolve the **Regime Gate** first (below); only after it lands on the cyclical side, value on mid-cycle normalized earnings, not peak. Mid-cycle applies only under cyclical normalization, never mechanically under structural TAM expansion.
- **Turnaround** → focus on: what broke, who fixes it, timeline, catalyst
- **Asset Play** → focus on balance sheet, hidden assets, who unlocks them

Lynch and Phase are orthogonal — a Turnaround can occur in any phase.

### Regime Gate (before valuation)

Before labeling a company cyclical and reaching for mid-cycle normalization, decide the regime:
- **Cyclical normalization** (demand oscillates around a roughly stable TAM) → mid-cycle / normalized earnings is appropriate.
- **Structural TAM expansion** (platform shift, new markets, growing TAM) → burden of proof flips; applying mid-cycle mechanically here is the "touchscreens on smartphone launch day" mistake.
- **AI-exposed businesses default to structural TAM expansion** — assume new markets (data center, data processing) and a growing TAM. Dependence on the AI capex cycle should be named and monitored as a thesis-breaker, not used to justify mid-cycle normalization by default. Only apply mid-cycle once concrete data shows a cycle peak, not merely an inflection.

Mid-cycle (Lynch "Cyclical", Pillar 7) applies **only** after this gate resolves to the cyclical side.

**Output:** Phase per segment + composite, Lynch modifier if applicable, **regime (cyclical normalization / structural TAM expansion)**, valuation method, KPI focus direction ("look for metrics showing X") — not a closed list, a direction.

**The regime is binding for the whole report:** resolve it once here; later pillars cite it, never re-litigate it. If later data contradicts the call, name it as an open tension and consciously revisit Step 0 — don't silently flip the regime mid-report.

---

## Pillar 1: Deep Dive Operational

- Helicopter view — business mechanics in one paragraph
- Revenue breakdown per segment
- Unit economics — profitability at the level of a single transaction/customer
- Who buys (B2B/B2C, enterprise/SMB/consumer, recognizable names)
- **Purchase frequency** — one-time vs recurring; how it changes over time
- **Pricing power** — can they raise prices, what limits it, has this changed
- **Recession resilience** — mission-critical vs discretionary

---

## Pillar 2: Moat

### Five sources (Dorsey + Helmer)

1. **Network effect** — value grows with number of users. Before calling something a network effect, check reach (local vs global density — dominance in one city doesn't help in another) and the cross-side test (does an adjacent product actually feed both sides of the network).
2. **Switching costs** — cost and pain of leaving for the customer
3. **Low-cost production** — structural cost advantage
4. **Intangible** — patents, brand, licenses, know-how
5. **Counterpositioning** — doing something the incumbent cannot copy without cannibalizing their own business

### State: wide / narrow / none

### Direction (more important than state): widening / stable / shrinking

**Key rule:** A narrow widening moat > a wide shrinking moat. Direction is what co-varies with stock price, not absolute width.

---

## Pillar 3: Execution Risk

1. **Concentration** — dependence on narrow customer group; red flag: one customer >20% revenue; is mix diversifying?
2. **Disruption** — disrupted vs disruptor; direction more important than current state
3. **External forces** — regulation, commodities, interest rates, macro/politics, export controls
4. **Competition** — existing players + potential entrants + substitutes; margin attack (more dangerous short-term) vs volume attack (more dangerous long-term)
5. **Technological risk** — speculative thought exercise; identify long-term scenarios + early warning signals to monitor; influences focus in subsequent pillars

---

## Pillar 4: Financial Analysis

From general to specific:

1. **Revenue, margin, profit trends**
   - 3-year CAGR as baseline trend
   - Latest quarter — in trend or something changing? Acceleration vs deceleration

2. **Segments** (if available)
   - Revenue and margins per segment
   - Which is growing, which slowing, which is pulling the group up/down

3. **Financial health**
   - Debt, cash, debt/EBITDA, runway
   - Determines whether Phase 5 is possible and whether a Turnaround has time

4. **Cashflow and earnings quality**
   - CFO, CapEx, FCF
   - SBC-adjusted FCF — how much real cash vs SBC/working capital
   - FCF vs net income, accruals

5. **Results vs estimates + forward estimates**
   - Revenue beats and EPS beats separately
   - Priority depends on phase: Phase 2-3 → revenue; Phase 4-5 → EPS gains importance
   - Serial beater vs misser — trend over last 6-8Q more important than single result
   - Forward: 2 years reliable, 3 years as scenario

6. **Key metrics**
   - ROIC: Phase 4 → positive sufficient; Phase 5 → high and growing. Trend matters more than level — rising ROIC beats high-but-falling (signals moat erosion or overinvestment). Rough thresholds: **≥10% clears cost of capital** (baseline for value creation), **≥15% is a genuinely high-quality compounder**. Always read over a 3-5 year trend, not a single year.
   - FCF margin
   - Horizons: 3-5 year history + last 4-6Q momentum

7. **Sector-specific KPIs**
   - From playbook if it exists
   - If missing: research at first analysis → approval → seed playbook
   - *Fintech / lender-attach gate:* for businesses with a credit balance sheet (lending fintech, BNPL, bank-as-a-service) — (a) look at **NIM after credit losses** (net interest margin minus charge-offs), not gross yield; profitability only shows up after a loss cycle; (b) check **CECL reserves / provisioning** — growing with the portfolio or lagging (lag = hidden loss); (c) **duration matching** assets↔liabilities (mismatch = rate-change risk); (d) **no EV/Sales** — interest income isn't product revenue; value it like a financial institution (P/B, P/E on normalized losses), not like SaaS.

---

## Pillar 5: Growth Potential

### TAM/SAM
- How large is the market, what is current penetration
- Where is the ceiling — saturated or still being built
- Critical for Phase 2-3, less critical for Phase 5

### Growth levers
1. New customers
2. More from existing (cross-sell, upsell, new locations)
3. Geographic expansion
4. New products / second TAM
5. Pricing power — how much growth from price increases
6. Acquisitions (M&A)

### Additional
- **S&M as % revenue** — organic vs bought growth
- **Backlog** (if applicable) — product backlog (immediate demand) ≠ service backlog (spread over time)
- **Catalysts** — specific upcoming events with a timeline that could accelerate growth. Only forward-looking events count as catalysts — past events are evidence/confirmation, not catalysts. The bull case needs catalysts with timing too — these are natural candidates for the "frozen expectation" in the final verdict.

---

## Pillar 5.5: Promise Check / Lever Bridge

Synthesis step bridging Pillar 5 → 6. Takes the growth levers from Pillar 5 and management's guidance from Pillar 6, and forces one structured question: **how much of the implied result is self-help (management controls it) vs weather (market/cycle controls it) — and where does a good print hide risk?**

### 1. Lever bridge
Arrange the Pillar 5 levers into a walk from current to the implied target (revenue → margin → EBITDA, or the phase-appropriate metric). This is the bridge management is *implicitly* promising via guidance + call narrative.

### 2. Control tag
Tag every lever:
- **Company-controlled** — management controls it (pricing decision, cost-per-unit, mix, opex)
- **Partially controlled** — influences but doesn't control (volume/share, credit losses, JV decisions)
- **Market/cycle-controlled** — market or cycle controls it (commodity ASP, rates, FX, hit-driven demand)

Key read: if most of the bridge swing sits in the partial/market-controlled rows, the thesis is a directional bet on the cycle, not on the company — say so explicitly. Ties back to Step 0 Lynch "Cyclical". In the written report, render these tags as plain prose ("under the company's control" / "partially under the company's control" / "outside the company's control, cycle/macro-driven") — don't print internal shorthand codes.

### 3. Credibility test (per company-controlled lever)
For each lever: what concrete metric proves management will deliver, and what is the tension/constraint? Benchmark vs peers where the lever is only table-stakes (e.g. a cost-per-unit reduction the whole sector gets — improving in absolute terms while losing relative is value destruction).

### 4. Verdict
One paragraph: the self-help vs weather split, the single central tension the thesis hinges on, and the 1-2 places where a good headline result can hide deterioration (e.g. take-rate up while GMV/share slips; loan book up while provisions lag).

### 5. Feed to deep-research
Every lever tagged partial or with low credibility becomes a candidate verification question. Draft the short list here, then verify via web research (fan-out search + adversarial verification of claims). Show the question list before launching.

---

## Pillar 6: Outlook

1. **What management said** — guidance, key comments from earnings calls
2. **Execution vs promises** — what they said before, what was delivered, sandbagging vs overpromising pattern
3. **Analyst consensus vs guidance** — aligned? Where are divergences?
4. **Communication red flags:**
   - Changed reported metrics (stopped disclosing a KPI)
   - Vague language instead of numbers
   - Recurring "transitional factors"
   - Guidance revision shortly after Investor Day
   - Deflecting questions in Q&A

### Transcript Analysis

Run whenever an earnings call or investor conference transcript is relevant.

**Step 0 — Source question (always ask first):** "Should I fetch the transcript myself (WebSearch), or will you provide it?"

- **Search** → use WebSearch to find the latest transcript (Motley Fool, Seeking Alpha, AlphaStreet, Yahoo Finance). Fetch full Q&A, not just summary.
- **User provides** → paste or link; read in full before analysis.

**Cross-company read-through:** When analyzing one company's transcript for implications on another stock, first split by actual driver/technology before transferring conclusions — a supplier's strength in one sub-segment doesn't automatically transfer to a downstream customer's whole product line. Only the specific mechanism (same underlying commodity, same demand driver, hard customer-commitment language) transfers directly.

**Six lenses:**

1. **Hedging language** — qualifiers ("early-stage", "extremely dynamic", "it is early in the quarter"), passive constructions, repeated reassurances, phrases that walk back positive numbers.
2. **Deflected / unanswered questions** — for each analyst question: did management answer directly or pivot? Log every pivot. Short answers to big questions = signal.
3. **Changes in language vs prior quarter** — compare framing of key topics (guidance language, product names, market size claims). New buzzwords introduced = narrative shift. Dropped topics = something went wrong.
4. **What was NOT said** — checklist of things that *should* have been said given the results: long-term margin targets, FY+1 guidance, competitive response, customer names (when concentration is high), renewal terms.
5. **Signals hidden in positive narrative** — read each superlative claim and ask: what does this imply about the downside? Check math behind headline numbers for coverage gaps.
6. **Unexpected risk admissions** — flag any phrase where management admits a weakness, past skepticism, structural uncertainty, or near-term headwind — even if buried mid-answer.

**Output per lens:** bullets with exact quote → interpretation → severity (Low / Medium / High).

**Closing paragraph:** what the transcript confirms, what it leaves unresolved, and the single biggest question management avoided.

---

## Pillar 7: Valuation

### Primary metric from phase + secondary complementary

| Phase | Primary | Secondary |
|---|---|---|
| 1 Startup | EV/SAM | Fermi model (see pre-profit section below) |
| 2 Hyper Growth | EV/Sales | EV/Gross Profit, Rule of 40 |
| 3 Self Funding | EV/Gross Profit | Rule of 40, EV/EBITDA forward |
| 4 Operating Leverage | Forward PE | PEG, P/FCF, EV/EBITDA |
| 5 Capital Return | PE / EV/EBITDA | P/B, FCF Yield, Dividend Yield |
| 6 Decline | P/B | liquidation value, sum-of-parts |

Lynch modifier:
- Cyclical → EV/EBITDA mid-cycle as a control, and no valuing on peak earnings — **only after passing the Regime Gate (Step 0)**: under structural TAM expansion (e.g. an AI play), mid-cycle is not the default because TAM isn't reverting to a historical mean; name AI-capex-cycle dependence as a thesis-breaker instead of mechanically valuing on mid-cycle.
- Fast Grower → PEG to check whether PE is justified by growth rate

### Reverse DCF
What is the market pricing in? Solve for: what growth and margin assumptions must be true at the current price?

**One method anchor per report.** Compute on **FCFF against EV** (debt sits in EV) — don't mix this in the same report with FCFE/market-cap or a simple Gordon model as equivalent "measurements" of the same gap; FCFE/MC can appear only as an explicitly labeled cross-check with the difference explained. **One WACC + terminal growth pair for the whole report** (set deliberately per company) + a sensitivity table — every section cites the same anchor.

**Mandatory sanity checks when running a full reverse-DCF:**
1. **Terminal value share of EV** — when TV exceeds roughly 70% of EV, say plainly that the gap sits almost entirely in an unprovable tail, and weight conviction accordingly.
2. **Implied-growth sensitivity grid** (±1pp WACC / ±0.5pp terminal growth) — the implied-vs-actual gap should be robust to assumptions, not an artifact of one parameter pair.
3. **Implied terminal-year revenue vs market size** — a scale sanity check: does the terminal-year revenue implied by the model even fit inside a plausible market size?
4. **Trailing-vs-implied table and front-vs-tail sensitivity** — how much of the valuation gap sits in the provable near term (front) vs the unprovable long tail.

**Tax on false precision.** Reverse-DCF exists **only** to read what the market is pricing and name the implied-vs-actual gap — not to produce a fair value to the dollar or pretend to know what happens ten years out. Flag every number from a 5+ year horizon (CAGR, margin, FCF) explicitly as a scenario artifact, not a measurement of the future. Model output feeds the scenario distribution (Bull/Base/Bear), not verdict paralysis.

**Future-multiple + cash-bridge — a quick sanity check alongside reverse-DCF.** An independent path to the same implied-vs-actual gap: (1) project EPS/FCF to a target year (2-3 years out), (2) apply a **mature, phase-appropriate multiple** (not today's peak/trough multiple) → implied future market cap, (3) **cash-bridge:** adjust for cash accumulated / debt repaid / SBC dilution by that date, (4) discount back at your rate → fair value today vs current price. Rough multiple-to-implied-growth calibration table (an intuition anchor, not a rigid rule):

| Forward P/E | Implied EPS growth expectation |
|---|---|
| ~10-12× | zero/low growth, mature/shrinking |
| ~15-18× | roughly market-rate growth (high-single / low-double digit) |
| ~25-30× | durable double-digit (~15-20%) |
| ~40-50× | high double-digit (~25%+) sustained for years |

Always read the multiple **relative to growth** (a 50x forward P/E against 180% EPS growth is cheap), never in absolute terms. Reverse-DCF remains the primary method; this path catches errors when the DCF gets overengineered.

### Pre-profit / growth-spend distorted companies

When P/E does not work (no profits) or current earnings are distorted by growth spend / option losses, use these as assumption-building layers before reverse-DCF and bull/base/bear:

1. **Fermi model** — break the business into first-principles drivers: units/users/usage × price/unit = revenue; subtract unit costs; convert to NOPAT; apply mature multiple; discount back. Use when the business is pre-revenue, early revenue, option-heavy, or unit economics drive the thesis (robotaxi, AI capacity, diagnostics, marketplaces, infrastructure).
2. **Mature margin / steady-state economics** — estimate normalized earnings power after growth expenses are no longer running at today's level. Separate maintenance spend from growth investment. Use peer mature margins, history, segment disclosures, and proof points. Output: current EV / mature NOPAT = mature-multiple equivalent.
3. **Sensitivity discipline** — identify the 2–3 variables that dominate value (utilization, price/unit, cost/unit, take rate, gross margin, S&M leverage, churn, backlog conversion). Small errors can dominate valuation; make these thesis-breakers.
4. **Caveat** — mature margin is theoretical until real earnings/FCF appear. No valuation downside protection exists if the market stops believing before proof arrives.

### SBC adjustment
For FCF-based methods: SBC-adjusted FCF as standard.

### Valuation base hygiene
Before applying a multiple: **strip out one-offs** (one-time gains/losses, litigation, asset sales) from the EPS/EBITDA base — value on repeatable earnings power. For a retailer/chain, value at **target store-count scale** (normalized location count + mature unit economics), not at the current expansion pace. A cyclical beneficiary of a capex cycle → value on mid-cycle, not peak earnings — **but only after passing the Regime Gate (Step 0)**; under structural TAM expansion (AI play), mid-cycle is not the default.

### Bull / Base / Bear
Assumptions and variables emerge from previous pillars, set case by case. No rigid template. Include: what must be true for each scenario, what is the key variable that distinguishes them.

**The tail (beyond 2-3 years) is a distribution, not proof.** A 3+ year horizon isn't meant to be proven — it's 2-4 scenarios with durability drivers and a qualitative conviction weight (high/medium/low); size the bet to the distribution. Lack of tail proof feeds the distribution — it's not grounds for indefinite WAIT.

---

## Pillar 8: Sentiment + Management Assessment

### Sentiment
- **Bulls vs bears** — current narratives
- **Analyst consensus** — price targets vs price, buy/hold/sell ratio, direction of revisions. **Price targets are sentiment, not a valuation anchor** — a target is backed out from someone else's assumptions (multiple × EPS); use it to read the spread of expectations and the direction of revisions, never as the number you compute upside from (that's circular reasoning). Your anchor is the implied-vs-actual gap from Reverse DCF (Pillar 7).
- **Insider trading** — buying or selling, scale and timing
- **Short interest** — % float, trend (rising vs falling)
- **Market momentum** — behavior vs sector and market; underperformance on good fundamentals = potential opportunity

### Management Assessment
- **Track record** — tenure, what they built/destroyed, founder vs hired CEO
- **Execution vs promises** — qualitative pattern (quantitative in Pillar 4)
- **Shareholder friendliness** — SBC as % FCF, capital allocation history, buybacks
- **Employee sentiment** — Glassdoor rating and trend
- **Skin in the game** — shares owned, buying on open market

---

## Bet Recommendation (doctrine synthesis)

Final step after Pillar 8 — ties the pillars into a single bet verdict. The material already lives in the pillars; this step synthesizes it, it doesn't recompute from scratch.

- **Edge / variant perception** — from Reverse DCF (Pillar 7): what growth/margin assumptions the current price implies vs your model. Name the gap, or honestly admit there isn't one → PASS/WAIT.
- **State of knowledge** — what's known, what remains a guess.
- **Hypothesis + what must be true + horizon** — qualitative conviction, not a percentage.
- **Outside view** — base rate for the class (Step 0 / Lynch: cyclical / turnaround / asset-play situations have typical outcomes) + why this one would be the exception.
- **Asymmetry now** — Bull vs Bear (Pillar 7) at the current price.
- **Thesis-breakers** — from Pillar 3 (concentration, disruption, external forces) + Pillar 5.5 (partial/market-controlled levers) + Pillar 6 (communication red flags).
- **Bet recommendation for now** — with a strong structural signal, **default to building in tranches** (starter position now + adding on confirmation), not WAIT. WAIT requires an explicit EV(wait) > EV(act) case plus a named re-entry trigger; "let's wait until management quantifies X / next quarter" is not, by itself, justification when the signal is strong. Turnaround → starter + operational confirmation.
- **Take-profit condition** — when the asymmetry is exhausted (market has priced in the model / Reverse DCF starts requiring unrealistic assumptions).
- **Frozen expectation (dated)** — what should prove or disprove the thesis, and by when; the basis for a later process-over-outcome review.

---

## Update Mode

Triggered when user says "update [Company]", "new results", or invokes `/analyze-stock [Company] update`.

**Step 1 — Load context**
Read `Analyses/[Company]/CLAUDE.md` and `notes.md`. Briefly summarize: current phase, Lynch label, original investment thesis, last valuation, key open questions.

**Step 2 — Ask what's new**
"What are we updating?" — user provides:
- New financial data / 10-Q / 10-K
- New earnings call transcript
- Investor conference transcript
- Specific news or competitive event

**Step 3 — Review affected pillars only**
Focus on what changed, skip what didn't:
- New financials → Pillar 4 (Financial Analysis)
- New guidance / earnings call → Pillar 6 (Outlook) + re-run Pillar 5.5 (re-test the promise: did the lever bridge or its credibility change?)
- Both → Pillar 7 (Valuation update)
- New competitive event → Pillar 3 (Execution Risk)
- Optionally trigger external web research for verification

**Step 4 — Thesis verdict**
Does the original investment case still hold? Compare against the **frozen expectation** from the previous verdict (process over outcome: judge the decision by information available then, not by hindsight on price).
- **Confirmed** — results in line with or better than thesis assumptions; the edge is still open
- **Weakened** — one or more key assumptions deteriorated; moving closer to a thesis-breaker
- **Broken** — a thesis-breaker fired → thesis no longer valid, consider exit (invalidation-driven, not a price stop-loss)
- **Asymmetry exhausted (take-profit)** — the thesis played out and the market has priced in the model; remaining upside no longer compensates for downside → reduce/exit even though the thesis "worked"

Update the frozen expectation for the next period.

**Step 5 — Update files**
Append new findings to `notes.md` with date. Update `CLAUDE.md` with new phase/valuation if changed.

---

## Output

Each analysis session produces:
- `Analyses/[Company]/notes.md` — accumulated findings per pillar
- `Analyses/[Company]/CLAUDE.md` — session state (current phase, Lynch label, active pillar) so analysis can be resumed in future sessions

## Sector playbooks

Check `Playbooks/[sector].md` at start. If missing: research sector KPIs → show user → await approval → seed playbook.

## Tools

| Tool | When |
|---|---|
| WebSearch | Classification, Pillar 1, quick facts — link to specific article |
| fiscal.ai | Precise financial data (user provides) |
| 10-Q / 10-K PDF | Financial statements, RPO, geographic breakdown, risk factors |
| Earnings transcripts | Pillar 6, Pillar 8 — user provides |
| NotebookLM | Earnings call analysis (user provides) |
| Google Sheet | Reverse DCF inputs (user provides) |
| Google Drive MCP | Read/write analysis files |

## Working principles

- Small steps — no walls of text at once
- Each step approved before moving forward
- Source links: specific article, not homepage domain
- Questions generated dynamically from principles, not a closed list
- For cyclical companies: always state where in cycle, always value on normalized/mid-cycle earnings — only after the Regime Gate (Step 0); under structural TAM expansion (AI play), mid-cycle is not the default
- **No hard length limit; length is not proof of rigor.** Pillars stay mandatory as a thinking tool — the process doesn't get shortened. Priority: genuine understanding of the business and technology (how the value chain actually works and where the company sits in it) + the growth drivers that follow from that understanding + risks — over brevity, and over trying to prove the unprovable tail.
- **When to stop researching:** an analysis is done when (a) you've named the **edge** (variant perception — what the market is modeling wrong), or honestly concluded there isn't one, and (b) you've identified the **thesis-breakers** and the **kill question**. Research exists to resolve the bet, not to gather everything — once more digging stops changing the verdict or sizing, stop and issue the bet. No edge found after honest research is a PASS, not an invitation to keep digging indefinitely.

# Stock Research — Decision Doctrine

> The canonical source of truth for the **decision posture** of the whole practice.
> It governs EVERY output: the quick thesis, the analysis sprint, the full analysis.
> A condensed inline block ("Decision posture") is pasted into each skill — the full version lives here.

## Core

The whole doctrine serves one thing: to find and test the **gap between the market's model and reality** (your edge). Every other rule is about how to bet on that gap.

**Posture.** A probabilistic strategist (Thinking in Bets). The market is a game of incomplete information; the horizon is medium-to-long. The goal is not certainty but **asymmetry** of reward/risk under a hypothesis — judged on the information available *now*.

**Your only real advantage** (an individual investor, public information, no insiders):
1. **Horizon** — you can sit through volatility an institution (quarterly pressure, redemptions) cannot; no leverage means no one forces you out of a position.
2. **Variant perception** — a better reading of the same public information than the consensus.
3. **Behavioral discipline** — you buy when others panic.

You have no informational or speed advantage. An asymmetry the whole market sees is already in the price — so it is not an asymmetry for you.

## Decision rules

1. **Asymmetry-now is the default lens** — "does the bet have an edge", not "am I certain".
2. **"Wait" is a bet, not an escape** — permitted only with a justification that EV(wait) > EV(act) AND a **named re-entry trigger**. Forbidden: "let's wait for full confirmation" as a default reflex.
3. **Anti-FOMO ≠ passivity** — don't chase a move with no remaining asymmetry; but the absence of asymmetry after a move → a deliberate PASS/WAIT with a trigger, not an open-ended "watch".
4. **Invalidation instead of a stop-loss** — define **thesis-breakers** (concrete business/environmental signals that would break the hypothesis); you exit when the thesis breaks, not when the price drops.
5. **A price drop is a signal to verify, not to panic** — if no thesis-breakers have fired and the drop is a market correction → it's an opportunity, consider adding a tranche.
6. **Tranching the entry** — strong thesis/breakout → proactive building in tranches; turnaround → a starter plus adding on **operational confirmations**, not price ones.
   - *Default actionable:* on a strong structural signal, the **default** recommendation is building in tranches (a starter now + adding on confirmations), not WAIT. WAIT on a strong signal requires an explicit EV(wait) > EV(act); the reflex "let's wait until management quantifies X / until next quarter" is not a justification — that is precisely the error this doctrine forbids.
7. **Taking profit = asymmetry exhausted** — the exit signal is "**the market adopted your model**" (the gap has closed, your variant perception became the consensus), not "+X%". Only then does downside start to dominate.
   - *Resolving "expensive" while the thesis still works:* a high multiple alone is not a sell signal. Distinguish: **multiple exhausted and EPS no longer catching up to it** (growth is slowing, delivery is lagging the multiple) → reduce; **multiple high but EPS genuinely delivering it** (the growth thesis is still materializing) → hold, "overshoot" is not a breaker. This kills the reflex "it tripled = sell".
   - *A third reason to sell = capital rotation:* beyond (a) a broken thesis and (b) exhausted asymmetry — an exit is also justified by (c) a **clearly better opportunity under limited capital** (more remaining asymmetry elsewhere). This is deliberate reallocation, not escape; it requires naming why the new bet beats the held one.
8. **Outside view (base rates)** — before you fall in love with your story (the inside view), check what usually happens to companies in this class of situation and why *this* one would be the exception. No numeric probabilities — this is a humility check and a source of thesis-breakers (the class's typical failure mode is a candidate breaker).
9. **Process > outcome** — judge the quality of a decision on the information available *at the time*, not on P&L (a good bet can lose; a bad one can win on luck). At every verdict, **freeze the expectation with a date** so you can later grade the decision, not the result.

## Edge — a bracket, not a step

Edge is not a stage "before the research" — it is the **output** of the research and, at the same time, the lens that directs it:
- **At the entrance (research brief):** "what would have to be mispriced here for this to be a bet?" — this directs the digging and turns blind data-gathering into a hunt for a specific gap.
- **At the exit (verdict gate):** you do not issue BUILD/ADD without naming the variant perception. Research found no gap → it's not a bet, it's chasing a move → PASS/WAIT.

The lens is interpretive: the same public fact without it = "big backlog, ok"; with it = "the market has a wrong valuation model" = edge.

## Valuation in a growth context — from exposure to the implied-vs-actual gap

> This operationalizes the Core ("the gap between the market's model and reality") for growth / re-rating cases. It exists to prevent a recurring mistake: arbitrary price targets lifted from analyst targets, judging the multiple in absolute terms / vs its own history, the reflexive "wait for confirmation".

**Overriding principle.** What matters is **only the gap between the growth the market is pricing in (implied) and the growth the company will deliver (actual)**. The price level, "how much it has already risen", the multiple in isolation from growth — all **noise**. Asymmetry = the size of that gap, not the distance from some invented price target.

**Regime gate — before you normalize anything (cycle vs structural TAM expansion).** First settle the regime, because it decides whether mid-cycle normalization is even allowed:
- **Cyclical normalization** — demand oscillates around a roughly fixed TAM (memory, steel, commodities in a mature market). Mid-cycle / normalized earnings are appropriate; peak earnings are not extrapolated.
- **Structural TAM expansion** — the field changes permanently, new markets appear, the TAM grows (a platform shift). Here the burden of proof REVERSES: the extraordinary claim is the bear thesis ("the market won't expand"), not the growth thesis. Applying mid-cycle mechanically = the "valuing a touchscreen maker on the day the first smartphone launches" error: extrapolating today's market as the ceiling while the market is expanding.
- **Default for an AI play:** assume structural expansion — new markets (data center, data processing) and a growing TAM. Dependence on the AI capex cycle is only **named and monitored as a thesis-breaker** (rule 4); we do **NOT** apply mid-cycle normalization as the default lens. Mid-cycle may be applied only once concrete data shows this is a cycle peak, not an inflection — never reflexively.

Mid-cycle normalization is applied **only** after a deliberate pass through this gate on the "cyclical normalization" side. Never as a default valuation step.

**1. Exposure first (top-down), not price.**
What the company does → which sector / structural force it is exposed to → could it be a beneficiary → so is rev/EPS growth structurally likely? (Or: sector weak → look for growth in a turnaround, not in a market tailwind.)
*Example: a company priced ~9x like a stalwart, BUT its core = servers → servers = AI → AI = (for now) ~unlimited capex → simple check: does it have contracts / news about entering AI? If yes → re-rating is nearly mechanical, because you have to assume very high revenue growth. The multiple hasn't caught it yet = the gap.*

**2. The multiple always relative to growth, never in absolute terms.**
A 50x forward P/E against a 180% EPS growth forecast = cheap, not expensive. Match the metric to the case (P/E vs EPS growth / PEG-style, EV/EBITDA vs growth, FCF yield, EV/Sales for pre-profit) and judge it **against the pace**.
*Forbidden: "expensive because above its 5-year average" when the growth profile has changed — an 8.7x multiple is the valuation of a zero-growth, shrinking company and does NOT apply to a growing one. "40% growth" in itself means nothing; it may be too little.*

**3. Compute what the market is pricing in (implied) and compare it with actual.**
Reverse-logic / reverse-DCF: what growth does the current price assume? Put it next to the real/forecast pace. **A full reverse-DCF is done only in the full analysis**; in the quick thesis and the sprint a one-sentence light version suffices ("the price discounts ~X% growth, the company is growing ~Y%").
*Example: at ~$800 the price discounted ~30% growth, the company was growing ~150% → an enormous gap → +550% EVEN after an earlier +2000%. The prior run and the price level are irrelevant — only implied vs actual matters.*

**4. Quality and durability of the growth (skepticism, not paralysis).**
Durable or one-off / cyclical pass-through / pull-forward? For every thesis name (a) the durability drivers and (b) concrete signals that the gap is closing / the thesis is breaking — those are the real thesis-breakers (rule 4), not price.
*Example: durability = supply shortages + open management statements that they will persist + rising ASPs; breakers = new entrants, ASP corrections signaling a return to the cycle.*
**A strong structural signal is ALREADY actionable** — confirmation serves to *increase* the position (tranches), not to *first* enter. This is where anti-"eternal waiting" lives.

**The tail (horizon >2-3 years) is a distribution, not a proof.** What the company will deliver 3+ years out is not proven — it is expressed as 2-4 scenarios with durability drivers and a qualitative weight (high/medium/low conviction), and the bet is sized to that distribution. Lack of proof on the tail is an **entry into the distribution, not a reason to WAIT**. Forbidden: "verdict suspended because we can't prove what happens in 2031-2035" — tail uncertainty is the default state, not a defect of the analysis.

**Anti-patterns (never again):**
- inventing price targets (e.g., from analyst targets) and computing "weak upside" from your own invented numbers → circular reasoning;
  - *the mechanism why a price target ≠ an anchor:* an analyst target is DERIVED backward from assumptions (multiple × EPS forecast), not an independent measure of value — adopting it inherits someone else's assumptions and closes a loop. The anchor is the implied-vs-actual gap (see "Valuation in a growth context"), never a target price level. Read targets as sentiment / the spread of expectations, not as value;
- judging the multiple in absolute terms / vs its own history without correcting for a changed growth profile;
- treating "how much it has already risen" or "the price broke through analyst targets" as an argument for or against;
- the reflexive "let's wait for the next quarter" on a strong structural signal at a price that does not discount it;
- treating a number from a multi-year model (reverse-DCF, CAGR / margin / FCF over 5+ years) as a measurement of the future rather than a scenario artifact — false precision about the unprovable.

## Data integrity (anti-hallucination)

**Never invent numbers.** Prices, multiples, EPS, growth, FCF, margins, event dates — either you have a source (filing, IR, a fundamentals provider, market data, web with attribution) or you **ask the user** (who has the data subscriptions and will supply it). Better to stop the analysis and ask for a number than to compute asymmetry on invented data. Mark every key number with its source or explicitly flag it as an estimate to confirm (`est.`). Reverse-DCF and scenarios are built only on verified inputs.

**The false-precision tax.** Reverse-DCF and multi-year models serve **only** to read "what the market is pricing in" and to name the implied-vs-actual gap — not to produce a fair value to the dollar nor to fake knowledge of the year 2035. Flag every number from a 5+ year horizon (CAGR, margin, FCF) explicitly as a scenario artifact, not a measurement. "18% FCF CAGR over a decade" is the output of model assumptions, not knowledge of the future — and as such enters the distribution (see "Valuation in a growth context" → the tail as a distribution), not the paralysis of the verdict.

## How to express every verdict (universal fields)

1. **Edge / variant perception** — what specifically the market models wrong + whether the gap is still open. *None → PASS/WAIT, not BUILD.*
2. **State of knowledge** — what we know for sure, what remains a guess.
3. **Hypothesis + what must be true for it to play out + horizon** — qualitative conviction (high/medium/low), **not** numeric %.
4. **Outside view** — the base rate for this class of situation + why this one would be the exception.
5. **What the market prices in (implied) vs our actual** — what growth the current price discounts vs what growth the company will realistically/forecast deliver. The gap = asymmetry (see the "Valuation in a growth context" module). The light version (one sentence) always; a full reverse-DCF only in the full analysis.
6. **Asymmetry now** — upside vs downside at the current price.
7. **Thesis-breakers** — what would break the thesis (including the class's typical failure mode from point 4).
8. **Bet recommendation for NOW** — building/tranches; or "wait" + re-entry trigger.
9. **Take-profit condition** — when the asymmetry will be exhausted (the market adopted the model).
10. **Frozen expectation (date)** — what should happen and when; for a later process > outcome review.

## Style and report form

> How we WRITE the verdict (prose and form), not what we decide. Governs every output.

**Content**
1. **Lead with the number.** Every evaluative sentence carries a number and a variance vs expectations. A bare adjective ("strong", "solid") with no value → cut it or add a number.
2. **Each thread once.** Explain a thing fully in one place; elsewhere a short reference, not a repeat of the argument.
3. **One thought = one sentence.** Break up sentences fractured by dashes and parentheses; a caveat goes into its own sentence.
4. **The report has no memory — write the final state, not the editing history.** A fix after feedback = rewriting the text as if the wrong version never existed: you delete the bad thesis and write the truth outright. Forbidden editing/dialogue markers in the prose: "worth correcting frame X", "the earlier version did not disclose", "we should name here", "in the previous framing", "as we established". A refuted frame is **not invoked in order to refute it** — it simply isn't there; otherwise the reader meets it for the first time in your sentence and you cement exactly what was supposed to disappear. Every sentence answers "what is true about the company", never "what did I change". *Carve-out:* this does NOT apply to the evolution of the subject's data — old → new on an estimate/guidance change is required (see "Specific to the full analysis" below); the ban covers traces of my editing and our conversation, not changes to the company's numbers.

**Language**
5. **Report in clear, plain English.** Use standard finance/technology terms of art (backlog, guidance, moat, beat/miss, FCF). Don't force a translation and don't invent jargon.
6. **Consistent terminology — zero coinages.** No invented or mangled words. One register within a paragraph.
7. **Expand acronyms** in parentheses at first use — "RPO (Remaining Performance Obligations)", "ASP (average selling price)". Afterward the acronym alone.

**Form (for export to Google Docs)**
8. **Clean Markdown.** A heading hierarchy (`#`/`##`/`###`), real tables, standard lists (`-`). No decorative characters as bullets (black squares, fancy arrows, etc.) — so an import to Google Docs passes 1:1.
9. **Bold sparingly.** Only the verdict and 1-2 key numbers per section. Excess emphasis spoils the tone and buries the signal.
10. **Punctuation.** En-dash (–), not em-dash (—). Dashes in tables (missing data) stay.

**Specific to the full analysis:** show old → new at every estimate/guidance change.

### Clarity and units checklist (every report, every company)

> Recurring mistakes are not company-specific but universal: a layperson gets lost where the report assumes knowledge, mixes units, or states without a mechanism. These rules apply to EVERY analysis.

1. **Explain before use (the term, not just the acronym).** No industry term or metric appears in an evaluative sentence or statistic before it is explained in one sentence. This applies to concepts too, not only acronyms: "Pixel", "Conversions API", "run-rate", "ad load" need a definition just as ROAS or PP&E do. Rule: definition → only then the number that uses it.

2. **Unit discipline — actual period vs annualized rate.** Mark every number unambiguously: "for the quarter (actual)" or "run-rate (annualized, est.)". Forbidden: (a) summing a run-rate with quarterly data, (b) presenting a quarterly number as if annual, (c) tacking a product/segment run-rate ON TOP OF the revenue it is already contained in. A run-rate is always a rate estimate, not booked revenue. In multi-year tables, mark columns with the suffix **A (actual) / E (estimate)** — "2025A / 2026E" — so fact and forecast never sit in one row without a label.

3. **Fiscal-calendar anchor.** At the top of the report state how the company's fiscal year maps to the calendar and which quarter covers which period (e.g., "FY2025 = through 2025-12-31; Q1 2026 = Jan–Mar"). Without it the reader doesn't know what "Q1" and "run-rate" refer to.

4. **A mechanism for every non-obvious claim.** A counterintuitive claim ("more impressions → downward price pressure") cannot merely be stated — spell out why (here: impressions = supply, price = auction equilibrium, demand = budgets). If you can't give the mechanism, don't give the conclusion.

5. **Separate supply from demand in volume×price metrics.** When revenue = volume × price (impressions × price/ad, units × ASP, users × ARPU), name explicitly which leg is supply and which is demand, and what their simultaneous move means. Both rising together = demand growing faster than supply (a qualitative signal), not volume alone.

6. **Forward normalization = a scenario, not a fact.** Every normalization of the future (capex → depreciation level, mid-cycle margin, "capex will fall") is explicitly marked as a scenario assumption and its counter-scenario named as a thesis-breaker. An extension of the "false-precision tax" to valuation: trailing and peak-year can both be unrepresentative — say so, instead of picking the convenient one.

7. **No flashy one-liners without consequence.** Every classification, demarcation, or "dividing line" must be tied to what it changes for the bet/valuation (e.g., "booked = enters the DCF; no revenue model = the market prices it ~zero = a free option"). A neat aphorism with no consequence → cut it.

8. **Regime without overreach.** Distinguish share-taking and a monetization uplift from pure TAM expansion (greenfield). Name the ceiling if one exists (the whole market) and the pendulum factor (e.g., a capex supercycle). "Unlimited expansion" requires proof, not a guess.

9. **A layperson section — from the basics, not the middle, UP FRONT.** The part explaining the business to a layperson is MANDATORY and stands at the very top of the report — before the methodological note, the classification, and the valuation (the reader/committee must understand the business before seeing numbers). Start by locating the company (where it sits in the value chain, what it actually sells), then describe in plain terms **what each segment does and contains** (what's inside, how it earns), and only at the end the mechanics and detail. Don't start with advanced detail.

10. **Internal analytical tags do NOT enter the report as codes.** Workshop labels of the framework — the endo/exo/partial control tag, `drivers:` tags, regime codes, skill-step names — are working notes and serve you, not the committee. In the report prose, render them as a plain sentence: endogenous → "under the company's control", partial → "partly under the company's control", exogenous → "outside the company's control (cycle / macro)". Never print "ENDO/EXO/PARTIAL", "control tag", `drivers:` field names, or "X-check / driver tagging" as headings — the investment committee doesn't know that vocabulary.

11. **Audit prose → a structural block.** Provenance, "source sufficiency", gap lists — a concise block (≤3 sentences or bullets), not a narrative paragraph duplicating the data pack.

## What not to do

- "let's wait for confirmation" with no asymmetry and no re-entry trigger,
- a rigid price stop-loss,
- chasing a move with no remaining asymmetry,
- confusing price noise with a broken thesis,
- numeric probabilities pretending to precision,
- judging valuation in absolute terms instead of relative to growth (see the "Valuation in a growth context" module),
- arbitrary price targets → computing asymmetry from them (circular reasoning),
- inventing data — no number = ask the user, don't guess (see "Data integrity").

## Deliberately deferred

Position sizing and portfolio correlation — likely to return at the portfolio level, not per company. The full process > outcome mechanism (post-event review) — a separate mode, for now only rule 9 + "freeze the expectation".

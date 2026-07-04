# Playbook: Software / SaaS (Application Software: CRM, ITSM, Creative, Fintech-SaaS, VMS)

Covers application software and SaaS businesses (CRM, ITSM, creative tools, fintech-SaaS, vertical market software). Used to evaluate whether AI is a threat or an opportunity for a given software business, and to calibrate valuation for revenue-rich, profit-poor SaaS names. Complementary to `Playbooks/enterprise-ai-infra.md` (hardware: servers/networking/storage, units × ASP, memory cycle) — where the two overlap (token pass-through, mature-margin valuation), this file cross-references rather than repeating.

*Note: figures below (retention rates, ARR growth, revenue multiples, cost-share percentages) are illustrative calibration points for understanding what a healthy vs. unhealthy level looks like — not current data. Always re-verify with fresh filings before citing a specific number.*

## Key operating KPIs

- **Billing unit + direction of pricing-model migration** — per-seat / usage-based / enterprise-wide. This is the key first question. Per-seat pricing combined with a customer's headcount shrinking due to AI is, on its own, **a transitional revenue wobble, not necessarily a structural break** — as long as value captured per transaction keeps rising. A useful historical precedent: on-premise-to-SaaS pricing transitions created short-term headwinds followed by a better underlying business. A shift from seat-based to usage/enterprise pricing is a volatility flag to monitor, not automatically a bear thesis. The most resilient pricing model ties billing to the customer account itself rather than headcount.
- **Net Revenue Retention (NRR/NDR) plus gross retention/churn** — the core signal, and a proxy for switching costs and entrenchment. NRR above 100% means the existing customer base is expanding in place. A drop in NRR is the first real red flag — it means the base itself is eroding, not just that growth is slowing.
- **Mission-critical vs. point-solution** — this single distinction determines the severity of AI-disruption risk. Mission-critical software (an error costs the customer real revenue, deeply embedded in a workflow) tends to hold its moat — vectors like in-housing or new entrants stay weak. A point-solution (one of thirty apps, non-critical, easily swapped) faces much sharper disruption risk. A useful test: "even if a competitor made an equivalent product for free, I still wouldn't switch" — that's a mission-critical signal.
- **% of revenue from AI products, and its growth rate** — is the incumbent keeping pace or standing still? A fast-growing AI product line inside an established vendor is a sign the incumbent isn't standing still. The absence of a growing AI revenue line, next to a disruption narrative in the stock, is itself a flag.
- **Exposure to adjacent incumbents** — which large player with distribution, brand, data, and existing customer relationships could move into this vertical (e.g., an ITSM vendor moving into CRM, or vice versa, or a platform company reclaiming share via bundling). The most dangerous competitor is usually an adjacent incumbent, not a hypothetical AI-native startup. Map adjacent platforms, not just startups.
- **Organic vs. M&A-driven growth, and platform coherence** — a unified platform (single clean codebase, faster feature rollout) vs. a patchwork of acquisitions (legacy code, slower integration, a laggard segment that eventually gets divested). Split growth into organic vs. inorganic; a patchwork platform carries higher maintenance cost and a higher risk that a segment eventually gets sold off or written down.
- **Reasoning layer / guardrails on top of the underlying model** — has the company wrapped a raw LLM in a deterministic, grounded layer suitable for enterprise use (e.g., an internal trust/grounding layer, or dedicated safety/fraud-detection layers for financial workflows)? Enterprises won't accept a probabilistic model directly touching billing or cash flows. This is simultaneously a moat (a real barrier for a pure AI startup to replicate) and a counter to the more extreme "AGI wipes out the whole software stack" bear case.

## Unit economics / Fermi drivers

- **Unit of analysis:** seat / workspace / usage unit (API call, transaction, document, workflow run) / enterprise account. Establish which unit the company actually bills on first — this determines sensitivity to AI (seat erosion vs. usage expansion).
- **Revenue bridge:** number of units × price/unit × NRR. For seat-based models, split the change in seat count (which can fall due to AI) from the change in price/seat from expansion/upsell. A falling seat count doesn't necessarily mean falling revenue, if usage- or enterprise-based pricing is capturing the value instead.
- **Cost/unit — token pass-through (critical in the AI era):** every LLM call is a token cost paid to a model provider, landing in COGS. The economic buffer here is that many competing models exist, and a routing layer that picks the cheapest adequate model removes pricing power from any single model provider — evidenced by companies swapping model providers with minimal business disruption. The optical risk is that token pass-through compresses margin *percentage* even while margin in dollar terms holds — an analogy to interchange fees in payments processing, where dollar margin holds but percentage margin looks worse. **Don't confuse an optical percentage-margin compression with a real deterioration in the underlying business.** (See also `Playbooks/enterprise-ai-infra.md` for the same pass-through mechanic on the hardware side, with GPU/memory ASP instead of tokens in COGS — same trap, different line item.)
- **Mature margin anchor:** a mature SaaS operating margin is typically in the 30–40%+ range, reflecting software's low incremental cost. Translate EV/Sales into an implied mature-margin earnings multiple to judge whether a still-unprofitable SaaS name is cheap or expensive — see Valuation below.
- **The "$1 of software to $3 of services" ratio — where AI pressure lands first:** for every $1 of software spend, there's roughly $3 of consulting/maintenance/integration/labor spend around it. AI tends to compress that $3 of labor cost first, before it touches the $1 of software. Some of that services budget can even shift *into* the software line (AI-assisted implementation tools, easier integrations), turning a feared AI headwind into a potential tailwind. Diagnostic: is AI pressure landing on the $3 of services (healthy — more software captured) or on the $1 of software itself (unhealthy)?
- **Sensitivity variables:** NRR, seat-count trajectory, token-cost as a % of COGS, % of AI-driven revenue, exposure to adjacent incumbents, mission-critical status (a binary severity switch), durability of growth (the main multiple driver).
- For revenue-rich, profit-poor SaaS, a Fermi-style build anchored on a mature-margin base is a useful assumption layer for a reverse-DCF.

## Key financial KPIs

- **NRR and cohort economics** — the single most important financial signal of durability (see operating KPIs above).
- **Operating margin (current vs. mature) and the path of operating leverage** — the company's lifecycle phase matters: hyper-growth names reinvest aggressively, mature names should show leverage. The trajectory of margin matters more than the current level.
- **SBC-adjusted FCF** — stock-based compensation can run quite high in SaaS; reported FCF without an SBC adjustment overstates quality.
- **Deferred/unearned revenue as a quality adjustment to FCF:** the working-capital benefit from up-front billing only exists as long as the company keeps growing bookings. When growth slows, this tailwind reverses. Always discount the portion of reported FCF that's really coming from this billing-timing effect rather than from underlying earnings power.
- **ROIC** — a strong test of quality for compounders, more informative than margin alone.
- **Depreciation lag / maintenance vs. growth capex** — relevant for capital-heavy, data-center-dependent SaaS/hyperscaler-adjacent names: when capex grows meaningfully faster than depreciation, reported earnings are overstated relative to true maintenance-adjusted earnings, making headline P/E misleading. Recompute earnings using a maintenance-capex-equivalent-to-depreciation assumption to reconcile P/E with P/FCF (this is the same capital-intensity mechanic as in the hardware and semiconductor playbooks).

## Valuation metrics (sector-specific)

- **Lifecycle phase drives the primary multiple:**
  - **Hyper-growth, profit-poor phase:** use EV/Sales, then translate it into an implied mature-margin earnings multiple and judge that multiple against the durability of growth. As a rough calibration, roughly 7x sales can be equivalent to roughly 25x mature-margin earnings at a ~35% mature margin and a ~20% tax rate; sustaining 20%+ growth for 3–5 years can justify a materially higher multiple than that. Always judge the multiple relative to growth durability, never in isolation.
  - **Later, operating-leverage/capital-return phase:** forward P/E, EV/EBITDA, and FCF yield; PEG relative to EPS growth.
- **Back out "what's priced in" before reaching a verdict:** market cap ÷ mature-margin multiple ÷ margin assumption → implied revenue/growth; compare that to the actual trajectory. The thesis needs to require *more* growth than what's already priced in, not just similar growth. Do this explicitly, as a separate step, before forming an upside view.
- **Reverse DCF** — back out implied growth; implied ≈ actual → fair, no asymmetry.
- **EV/Sales** — only useful as an input into the mature-margin calculation above, never as a standalone verdict.

## Sector-specific red flags

- **Falling NRR / rising churn** — the strongest single signal of moat erosion, stronger than a mere growth slowdown.
- **A pure point-solution vertical** (non-mission-critical, one of many apps, easily replaced) — in-housing and new-entrant risk are genuinely elevated here; severity is high.
- **AI pressure landing on the $1 of software before the $3 of services** — the unhealthy pattern (healthy: the $3 of services compresses first).
- **Dependence on a single AI model provider with no easy swap path** — if the company can't switch model providers without a major rebuild, it carries real token-margin and disintermediation risk (the healthy counter-example is a company that swapped providers with minimal disruption).
- **Token pass-through mistaken for business deterioration** — a falling margin percentage alongside rising margin dollars is an optical effect, not a bear thesis on its own — but still worth flagging, since markets sometimes punish it anyway, which can create a mispricing opportunity.
- **An unintegrated patchwork of acquisitions** — a laggard segment at risk of write-down or divestiture; check organic vs. M&A growth carefully.
- **No reasoning layer or guardrails around a mission-critical AI feature** — a raw LLM touching billing or cash flow is not yet enterprise-grade.
- **FCF driven by a deferred-revenue tailwind plus high SBC** — overstated earnings quality that fades once growth slows.
- **A multiple that requires an unrealistically long runway of hyper-growth** — even a great business can be a poor investment if the implied growth path is far beyond a reasonable base rate.
- **A binary, existential risk treated as if it doesn't exist** (e.g., a dominant future AI model bypassing the whole software stack, or a government service replacing a paid tax-prep product) — this shouldn't be waved away as a monitoring item; it should be priced explicitly as an accepted tail risk that the asymmetry needs to compensate for.

## Sources / benchmarks

- Public filings and management commentary for the companies used as calibration examples above.
- Mature-margin / Fermi valuation approach — see the valuation framework in `analyze-stock.md` (Pillar 7).
- Complementary hardware playbook: `Playbooks/enterprise-ai-infra.md` (shared mechanics: token/ASP pass-through, depreciation lag for capital-heavy models).

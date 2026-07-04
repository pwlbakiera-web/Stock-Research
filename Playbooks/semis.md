# Playbook: Semiconductors (Picks-and-Shovels AI — IP/Design, Fab Equipment, Foundries)

Covers the semiconductor supply chain: what to measure per layer, how to read the cycle and hyperscaler capex, where the moat sits, and typical red flags. Complementary to `Playbooks/enterprise-ai-infra.md` (demand-side servers/systems) — semis is the supply layer underneath it.

## Supply chain map — four layers of exposure

Each layer has a different margin/growth/moat profile. Establish which layer a company sits in first — KPIs and red flags differ by layer.

| # | Layer | Examples | Moat profile | Margin (illustrative) |
|---|---|---|---|---|
| 1 | **IP / design tools** | IP licensing (e.g., ARM), EDA (Cadence, Synopsys) | Ecosystem lock-in, near-duopoly in EDA, sticky switching costs | Very high gross margin (licensing-heavy models can run ~90%+) |
| 2 | **Chip designers (fabless)** | Nvidia, AMD, Broadcom, Marvell | Programming-language / ecosystem lock-in (e.g., CUDA), design IP | High but cyclical |
| 3 | **Wafer fab equipment (WFE)** | ASML (lithography/EUV), Applied Materials (deposition), Lam Research (etch), KLA (inspection) | Hard-to-copy equipment, near-monopoly at the leading node, deep supplier relationships | ~30–40% (reflects complexity) |
| 4 | **Foundries / manufacturing** | TSMC, Intel, Samsung | Scale + yield learning curve (a self-reinforcing catch-22), extreme capital intensity | High reported operating margin — but judge on ROIC, not margin |

*Figures above are illustrative calibration points, not current data — always re-verify against recent filings.*

## Key operating KPIs

- **Yield (Layer 4, foundry) — KPI #1.** Yield = working chips ÷ possible chips. The economics are highly non-linear: a new tool/node might start around 20–30% yield, a good process line runs around 80%, best-in-class exceeds 90%. Fixed costs are so high that profit barely returns below roughly 60% yield, while above that threshold incremental output is close to pure margin. Track the **yield trajectory on new nodes** as a leading indicator. Scale creates a catch-22: more volume → more iterations → higher yield → the moat deepens, because the learning curve accumulates in the field alongside the customer — a competitor with access to the same equipment can still fall behind for lack of accumulated yield know-how.
- **Ecosystem lock-in / switching costs** — the real moat usually sits in software/toolchain/IP standards (e.g., CUDA vs. ROCm, x86, ARM ISA), not in the silicon itself. A strong signal of incumbent moat strength: customers fund a rival specifically to avoid depending on a single supplier (e.g., a large AI lab backing a second GPU vendor to create an alternative to the incumbent's software stack).
- **"Hard-to-copy equipment" as a near-monopoly (Layer 3)** — margins of 30–40% reflect genuine complexity; near-monopoly status at a given node (e.g., EUV lithography has effectively one supplier). Test moat width with a replication-cost thought experiment: assume a challenger with $50–100B in capital, walk the chain — the critical links are already contracted to the incumbent, learnings are embedded, and the customer has no benefit from switching. The moat lives where capital alone can't buy your way in — where time and accumulated know-how are the binding constraint, not money.
- **Customer concentration — invert the read when the supplier is sole-source.** Concentration is only a risk when the customer has real alternatives or pricing leverage. When a supplier is genuinely sole-source, concentration risk shifts from pricing risk to volume risk — dependence on a handful of capex budgets, not margin erosion.
- **Channel inventory / bull-whip effect** — a ~10% drop in end demand can produce a 30–40% drop in orders, because channel partners destock their own inventory first. Sell-out is not the same as sell-in. When reading a quarter, always ask: is this a real demand drop or channel destocking?
- **Backlog (WFE)** — lumpy and supply-gated; backlog is not revenue. Equipment sales depend on a handful of hyperscaler/foundry capex budgets.

## Unit economics / Fermi drivers

- **Unit of analysis:** wafer/chip (foundry); tool/system (WFE); design win/license (IP/design layer).
- **Revenue bridge:** for foundries — wafers × ASP × yield (yield is embedded in the real revenue unit); for WFE — units × ASP, lumpy per capex cycle. Always split growth into volume vs. ASP — part of reported growth can be price pass-through rather than value capture.
- **Cost/unit:** enormous fixed costs (fab capex, node R&D, EUV tooling); marginal cost above the yield threshold is low, so operating leverage is strongly non-linear.
- **Utilization/frequency:** fab utilization, new-node ramp pace, yield trajectory, customer capex cadence.
- **Mature margin anchor:** for capital-intensive names, **anchor on ROIC, not margin** (see below) — a high reported operating margin doesn't say how much capital was required to earn it. EV/Sales is of limited use here.
- **Sensitivity variables:** yield trajectory on the newest node, hyperscaler capex trends, customer concentration, ASP per node, cycle phase.
- For cyclical or pre-profit ramp stories, a Fermi-style build is useful — but discount from **normalized mid-cycle earnings**, not peak (see Cycle section below).

## Key financial KPIs

- **ROIC > operating margin (for capital-intensive names) as the real quality test.** Margin alone doesn't capture how much capital was invested to generate it. In capital-intensive semis, a high margin paired with weak ROIC is not quality — always track ROIC and its trend.
- **Operating margin as a threshold signal, not a goal in itself** — it tells you where a company sits relative to the yield threshold (foundry) or complexity tier (equipment), but isn't a thesis by itself.
- **Capex/sales and reinvestment intensity** — inherently capital-heavy; watch the capex path relative to the demand cycle (overcapacity risk, see below).
- **Gross margin trend per layer** — equipment typically 30–40%, foundry manufacturing margins higher, IP/EDA very high; a falling gross margin despite rising revenue is a warning sign (destocking, ASP pass-through, or lost position at a node).
- **FCF and net-income-to-FCF conversion** — for names with very high cash conversion, when using a future-multiple valuation approach, add back the cumulative bridge-year free cash flow to the terminal value, or the return gets understated.

## Cycle and capex read-through

The core dynamic in this sector: a **secular AI-capex wave layered on top of a classic semiconductor cycle.** Separate the secular tailwind (hyperscaler AI capex) from the cyclical swing — these two forces get conflated in most narratives.

- **Capex read-through cuts both ways.** The same hyperscaler capex that is a company's revenue (machine sales, compute rentals) becomes its biggest risk when it reverses. Record hyperscaler capex is not automatically a safety signal — it can equally be an overcapacity warning. Nobody has ever run capex at today's scale without eventually overshooting and then lagging demand in the other direction. Work out who is hurt most when capex reverses (equipment suppliers vs. compute-capacity resellers) and treat that reversal as an explicit thesis-breaker, not a footnote.
- **Mid-cycle, never peak, times a multiple.** Start any chip analysis from the earnings-volatility history, not the growth rate. Current EPS is probably near a cycle peak — "peak EPS × a low multiple" is a classic value trap. Underwrite normalized mid-cycle earnings power.
- **Humility about cycle phase.** You only know it was mid-cycle after the fact — don't claim false precision about peak or trough. Build a thesis that survives being wrong about the phase, by haircutting the earnings assumption rather than guessing the phase correctly.
- **The bull-whip effect amplifies the cycle** — channel inventory corrections multiply the volatility of end demand (see KPIs above).
- **Picks-and-shovels: buy the enabler, don't guess the winning application.** It doesn't matter which end application wins — the enabling layer underpins the whole AI buildout regardless of which player wins downstream. Test: does demand flow to this company independent of which end-application player wins?

## Valuation metrics (sector-specific)

- Apply a cyclical modifier almost always — value on mid-cycle/normalized earnings, never on peak. Cheap on peak earnings is expensive on a normalized basis.
- **ROIC and its trend** as the primary quality test for capital-intensive names; mid-cycle EV/EBITDA as a cross-check; forward P/E only with explicit earnings normalization.
- Reverse DCF — back out implied growth, compare it to guidance and to the physical reality of growth (capacity, node trajectory). Implied ≈ actual → fair, no asymmetry.
- Future-multiple approach plus a cash bridge — out-year EPS × a fair multiple, then add the cumulative bridge-year FCF (critical for high-cash-conversion names).
- **Margin of safety = haircut the earnings assumption, not the multiple** — especially for cyclicals, where peak earnings are tempting. Lower the earnings forecast to a high-confidence level, then pay full price for that.

## Sector-specific red flags

- Yield stuck below roughly 60% on a new node — losses plus unhappy customers; a flat yield trajectory signals lost competitive position.
- High margin paired with weak or falling ROIC (capital-intensive names) — margin masking a capital-hungry business.
- Record hyperscaler capex treated as a safety signal — it's more often the opposite: an overcapacity warning, with demand lagging in the other direction later.
- Valuation based on peak EPS × a multiple — deep-cyclicals tend to revert to history even after a "this time is different" narrative.
- Customer concentration cited without noting whether the supplier is sole-source — sole-source concentration is a volume risk, not the same as concentration risk with a customer who has real alternatives.
- A switching-cost moat built purely on code (e.g., a proprietary GPU programming stack) — worth stress-testing against AI-assisted code migration tools that could lower the cost of porting away from a dominant stack; this is a real (if still uncertain) risk to the incumbent and a call option for challengers.
- "Better/cheaper" claims based on spec sheets or lab benchmarks — discount these to real production proof points; the gap between "on paper" and "in the real world" is itself a thesis-breaker for challengers.
- Sell-out vs. sell-in — revenue growth from channel restocking rather than end demand.
- A slowdown in hyperscaler capex — the main tailwind for the whole enabler layer fades once capex peaks.

## Sources / benchmarks

- Public financial data and filings (10-K/10-Q, investor days) for the named companies across all four layers.
- Sector data: SEMI/IDC-style industry reports on wafer fab equipment spend, foundry capacity, and node transitions.
- Company-specific figures (yield %, gross margin, market cap/revenue multiples) cited during any analysis should be treated as illustrative calibration points, not current facts — always re-verify against fresh filings.

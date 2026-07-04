# Playbook: Private Credit / BDC (Shadow Lending, Structured Products)

Covers exposure to the private credit asset class (roughly $2T and growing): listed and unlisted business development companies (BDCs), unlisted closed-end funds, non-bank shadow lending, and structured products. The central framework here: **separate liquidity risk (self-resolving if the underlying assets are healthy) from credit risk (permanent losses)** — market panic tends to conflate the two into a single generic fear. A secondary thread covers contagion: software-sector AI disruption flowing through to the lenders who financed take-private software deals.

Relevant names: BDCs (e.g., Blue Owl/OBDC, Ares/ARCC, Blackstone/BXSL, FS KKR/FSK, Golub/GBDC), unlisted closed-end funds (e.g., Cliffwater/CCLFX), banks with NBFI (non-bank financial intermediary) exposure, and alternative-credit managers (Blue Owl, Apollo, Ares, Blackstone).

## Key operating KPIs

- **Vehicle structure** — listed BDC vs. unlisted BDC vs. unlisted closed-end fund. A BDC is typically structured as a RIC (regulated investment company): it distributes roughly 90% of earnings, similar to a REIT, to avoid double taxation. Structure determines liquidity, gating mechanics, and leverage profile. Always establish which vehicle (and which share class) the exposure sits in.
- **Leverage** — BDCs were historically capped near 1:1 debt-to-equity; regulatory changes since have allowed up to roughly 2:1, meaning a bigger hit to equity when losses occur. Unlisted closed-end funds typically run lower leverage (~0.5:1) but usually lack gating protection. The direction and utilization of the leverage limit matters more than the limit itself.
- **NAV / mark vs. par** — NAV per share and its trend. Private loans don't trade on an exchange, so marks are inherently subjective. When a fund sells assets "at par," check for cherry-picking — i.e., whether the best loans were sold while the residual portfolio is worse. (Illustrative case: a large BDC sold a sizeable slice of loans near par, and redemption requests subsequently spiked sharply — investors inferred the remaining portfolio was weaker.)
- **Non-accruals** — the share of loans that have stopped accruing interest; a hard, unambiguous sign of credit deterioration. A rising ratio means credit risk is materializing, not just a liquidity event. Pairs with PIK% below.
- **PIK% (payment-in-kind)** — the share of interest added to loan principal instead of paid in cash. Rising PIK is a leading indicator of hidden stress: the lender is deferring pain to avoid marking the loan down (sometimes called "zombie lending").
- **Extend/amend rate** — how often loans get extended or renegotiated ("extend and pretend"). A rising rate is the same early-warning signal as PIK, appearing before losses or non-accruals show up.
- **Gating / redemption caps** — typical redemption limits run around 5% per quarter. Redemption requests running 10–40% signal real stress. Gating protects against fire sales but can paradoxically intensify a run, since a closed exit door makes everyone want out faster. Watch the redemption queue against the cap.
- **Seniority in the capital stack** — senior secured lenders are protected first, then junior debt, then equity, which absorbs losses first. Retail private-credit investors typically hold the equity tranche of a fund — establish where in the structure a given exposure actually sits.
- **Sector exposure of the portfolio** — the share of loans to software or other disruption-exposed sectors (commonly around 10%, sometimes up to 20% for some funds). Take-private software borrowers tend to be lower-quality and smaller than comparable public companies — if the public market is worried about a sector, the private-credit exposure to it deserves more scrutiny, not less.

## Unit economics / Fermi drivers

- **Unit of analysis:** an individual loan (or fund tranche) in the portfolio — senior secured, unitranche, or junior debt.
- **Price/unit (yield):** distribution yield = spread over the risk-free rate. Separate return *on* capital from return *of* capital — headline yield is sometimes partly a return of investors' own capital rather than earned income. A high yield implies a high spread, which implies embedded risk.
- **Cost/unit (fee layers):** typical structures stack an AUM fee (roughly 1–1.5%), a performance/carry fee (around 15% above a ~6% hurdle), and, for retail share classes, an upfront sales charge plus an ongoing trail fee. Non-fiduciary broker-dealers may be incentivized to push a more expensive share class. As Charlie Munger put it: "show me the incentive and I'll show you the outcome."
- **Subordination buffer (the key to reading credit risk):** even a buyout done at a rich purchase multiple typically has debt/EBITDA in the 4–6x range, meaning a thick equity cushion has to be wiped out before a senior loan takes a loss. A loan behind a thick buffer is not the same as an imminent default — which is exactly why the more likely near-term risk in a stressed environment is liquidity, not credit.
- **Sensitivity variables:** PIK%/extend rate (hidden stress), non-accruals (visible stress), redemption queue vs. gating cap (liquidity), leverage ratio (1:1 vs. 2:1 — the multiplier on equity losses), % exposure to a disrupted sector, realism of marks relative to par.
- **Liquidity-vs-credit framework:** whenever a fund is under stress, always separate a liquidity run (self-resolving if assets are healthy — solvable by selling good loans) from real credit deterioration (permanent losses, loans genuinely not worth par). A forced seller always gets a worse price — "you don't want to be a forced seller of anything, ever."

## Key financial KPIs

- **NAV trend and mark quality** — falling NAV, and how subjective the marks are (since private loans don't trade). A par sale is weak evidence of quality if it looks like cherry-picking.
- **Non-accrual ratio and its trend** — hard evidence of credit risk; a rising ratio means losses are materializing.
- **PIK% and extend/amend rate** — leading indicators of stress that show up before losses do; rising values signal markdown avoidance.
- **Leverage (debt:equity)** — 2:1 vs. 1:1 vs. 0.5:1; with deteriorating credit, 2:1 leverage multiplies the hit to equity.
- **Distribution coverage** — is the distribution covered by net investment income, or funded from return of capital or leverage? An uncovered distribution is a red flag.
- **Refinancing / maturity wall** — loans originated in a near-zero-rate era refinancing at today's higher rates is a stress point (higher debt-service burden for the underlying borrower).
- **Bank exposure to NBFI (systemic level)** — stress-test frameworks used by regulators estimate banks can typically absorb high-single-digit percentage losses on non-bank financial intermediary exposure — a useful threshold for monitoring bank/shadow-lending contagion.

## Stress mechanics (a typical sequence)

1. **Trigger** — early, idiosyncratic borrower bankruptcies (sometimes including outright fraud). Jamie Dimon's framing applies: "when there's one cockroach, there's usually more" — assume more issues are coming once the first one surfaces.
2. **Markdown avoidance** — lenders protect marks via PIK, extensions, and amendments ("zombie lending"). Stress builds but stays invisible in realized losses. This is where PIK%/extend rate act as leading indicators.
3. **Redemption run** — investors want out; redemption requests exceed the typical ~5%/quarter cap.
4. **Gating** — the fund halts redemptions to avoid a fire sale, which paradoxically intensifies the panic, since a closed exit makes the queue to leave even longer.
5. **Forced selling / cherry-picking** — the fund sells its best loans "at par" for liquidity, leaving a weaker residual portfolio, which drives further redemption requests — a self-reinforcing spiral.
6. **Resolution** — if the underlying assets are healthy (a thick equity buffer intact), this was a liquidity crisis that self-resolves. If the marks were fiction, a real credit crisis emerges, with permanent losses amplified by leverage.

## Sector-specific red flags

- Redemption requests above roughly 5–10%/quarter (breaching the gating cap) — a liquidity run; check whether the underlying assets are healthy before assuming it's a credit event.
- Rising PIK / extend-and-pretend / amend rates — the single most important early warning of hidden stress, appearing before non-accruals do.
- A par sale that looks like cherry-picking — a good mark on one transaction doesn't validate the quality of the whole remaining portfolio.
- 2:1 leverage combined with deteriorating credit — leverage multiplies the hit to equity; the combination is especially dangerous.
- Rapid growth of the lending asset class overall (the space has grown at a high-teens CAGR over the past decade) — fast growth is a base-rate warning sign of loosening underwriting standards to keep pace with investor demand.
- Shadow lending (non-bank, lightly regulated) — generally weaker disclosure and less visibility into underwriting quality.
- High bank exposure to NBFI — a useful contagion-monitoring threshold (see Key financial KPIs).
- Language patterns in communications — words like "transitional," avoidance of "default" or "markdown," and an emphasis on liquidity when the underlying data actually points to credit deterioration.
- A distribution not covered by net investment income (i.e., partly return of capital) — a high headline yield used as bait without real coverage.
- Layered fees combined with non-fiduciary distribution — a structural incentive for a broker-dealer to sell an expensive share class rather than the client's best option (Munger's incentives point, again).

## Contagion: software-sector disruption flowing into private credit

- **Channel:** private credit funds have lent to software companies (typically ~10% of a portfolio, up to ~20% for some funds); take-private software borrowers tend to be lower-quality and smaller than comparable public companies. Disruption risk to the software sector (see `Playbooks/software-saas.md`) propagates to whoever financed those companies' buyouts.
- **What to assess:** (a) the % of portfolio exposure to the disrupted sector; (b) where the exposure sits in the capital structure (senior loan vs. equity — i.e., how thick is the subordination buffer); (c) the quality of the take-private borrowers relative to their public peers.
- **Why this is a liquidity risk today, not (yet) a credit risk:** the exposure sits in loans, not equity. A buyout done at a rich multiple typically implies debt/EBITDA around 4–6x, meaning a thick equity buffer has to be wiped out before the loan itself takes a loss. It is a liquidity risk today, more than a credit risk today — that could change if the underlying disruption accelerates.

## Sources / benchmarks

*Note: figures below are illustrative calibration points for understanding scale and structure, not live data — always re-verify against current 10-Qs, N-2 filings, and fresh reporting before using them in an analysis.*

- Asset class size: roughly $2T, having grown at a high-teens percentage CAGR over the past decade (the growth rate itself is a base-rate flag on underwriting discipline).
- Leverage: BDCs up to roughly 2:1 (previously capped near 1:1); unlisted closed-end funds around 0.5:1.
- Gating: typically around 5%/quarter; stress is signaled by redemption requests in the 10–40% range.
- Illustrative case: a large BDC sold a slice of its book near par and subsequently saw redemption requests jump sharply — a textbook cherry-picking spiral.
- Subordination buffer: buyouts at rich purchase multiples imply debt/EBITDA around 4–6x.
- Software-sector exposure in typical portfolios: around 10%, up to ~20% for some funds.
- Fee layers (retail share classes): AUM fee ~1–1.5%, carry ~15% above a ~6% hurdle, plus upfront and trailing sales charges.
- Regulatory stress-test frameworks: banks are generally assessed as able to absorb high-single-digit percentage losses on NBFI exposure.
- Illustrative stress triggers: idiosyncratic borrower bankruptcies (including fraud cases), Jamie Dimon's "one cockroach" framing, Charlie Munger's incentives framing, and the refinancing wall for loans originated in a near-zero-rate era.

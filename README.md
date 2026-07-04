# Stock Research

A structured investment analysis framework built on top of Claude Code. Combines multiple analytical methodologies into a cohesive, step-by-step workflow for researching publicly traded companies — plus an autonomous pipeline that runs the same framework end-to-end without a human in the loop.

## What's in here

- **`analyze-stock.md`** — the manual, conversational analysis skill. Invoke with `/analyze-stock [Company]`.
- **`Playbooks/`** — sector-specific reference guides loaded during analysis: e-commerce, enterprise AI infrastructure, semiconductors, private credit, and software/SaaS.
- **`autonomous-analysis/`** — a self-contained autonomous pipeline that runs the same framework end-to-end from a single ticker: ingest → deterministic valuation → adversarial review → full report. See [`autonomous-analysis/README.md`](autonomous-analysis/README.md).

## How it works

### `/analyze-stock`

A structured framework that walks through a full company analysis, step by step:

0. **Classification** — assigns the company (per segment) to a lifecycle phase (Startup → Hyper Growth → Self Funding → Operating Leverage → Capital Return → Decline). The phase determines which valuation methods apply and what to focus on in each subsequent step. Lynch modifiers (Cyclical, Turnaround, Asset Play) apply on top when phase alone doesn't capture the dynamics — cyclical calls first pass through a **regime gate** (cyclical normalization vs structural TAM expansion) before mid-cycle valuation is allowed.

1. **Deep Dive Operational** — how the business makes money, who buys, how often, pricing power, recession resilience.

2. **Moat** — five sources (network effect, switching costs, low-cost production, intangible, counterpositioning), state, and direction. Direction matters more than current state.

3. **Execution Risk** — concentration, disruption, external forces, competition, technological risk.

4. **Financial Analysis** — revenue/margin trends, segments, financial health, cash flow quality, beat/miss history, key metrics, sector-specific KPIs.

5. **Growth Potential** — TAM/SAM, growth levers (new customers, geographic expansion, new products, pricing power, M&A), organic vs bought growth.

5.5. **Promise Check / Lever Bridge** — a synthesis step that tags each growth lever as company-controlled, partially controlled, or market/cycle-controlled, then asks how much of management's implied guidance is self-help versus weather.

6. **Outlook** — management guidance vs analyst consensus vs what was actually delivered, including a six-lens transcript analysis for earnings calls. Red flags in management communication.

7. **Valuation** — phase-appropriate primary metric + secondary metrics + Reverse DCF (what is the market pricing in?) with mandatory sanity checks (terminal-value share, sensitivity grid, scale check, front-vs-tail split), a future-multiple + cash-bridge cross-check, a Fermi/mature-margin path for pre-profit companies, and Bull/Base/Bear scenarios built from findings in previous steps.

8. **Sentiment + Management Assessment** — bulls vs bears, analyst targets (read as sentiment, never as a valuation anchor), insider activity, short interest, CEO track record, employee sentiment, shareholder alignment.

**Bet Recommendation** — a closing synthesis: edge/variant perception, outside view, asymmetry at the current price, thesis-breakers, a take-profit condition, and a dated "frozen expectation" to review against later.

The analysis is conversational and step-by-step — you drive the pace, ask follow-up questions, and approve each step before moving forward. Questions are generated dynamically based on the company's classification, not from a fixed list.

### Playbooks

Sector-specific guides loaded at the start of analysis when a matching sector is identified. If no playbook exists for a sector, one is researched and built during the first analysis of that type.

- `Playbooks/ecommerce.md` — GMV, take rate, healthy vs unhealthy growth, network effects, subsidy wars
- `Playbooks/enterprise-ai-infra.md` — servers/AI systems, networking, storage, as-a-service; units vs ASP, backlog concentration, cyclical valuation
- `Playbooks/semis.md` — picks-and-shovels semiconductors; supply chain layers, yield economics, ecosystem lock-in, capex read-through
- `Playbooks/private-credit.md` — private credit / BDCs / shadow lending; liquidity-vs-credit framework, leverage, NAV/mark-vs-par, non-accrual and PIK stress signals
- `Playbooks/software-saas.md` — application software/SaaS; NRR, mission-critical vs point-solution, mature-margin valuation by phase

### `autonomous-analysis/`

A separate, self-contained pipeline that runs the same 8-pillar framework autonomously: from a single ticker it ingests data, runs a deterministic valuation engine, drafts a thesis, attacks it adversarially, and outputs a full report plus a verdict card — no human in the loop. It's not a runtime dependency of `analyze-stock.md` (the tool is fully self-contained), but it implements the same underlying methodology as an unattended pipeline. See its own [README](autonomous-analysis/README.md) and [DOCTRINE](autonomous-analysis/DOCTRINE.md) for details.

## Setup

### Requirements

- [Claude Code](https://claude.ai/code)
- fiscal.ai account (for financial data)

### Installation

1. Copy `analyze-stock.md` to `~/.claude/skills/`.
2. Register the skill in `~/.claude/CLAUDE.md`:
```markdown
## Skills
- **analyze-stock** — Full investment analysis framework. Invoke with `/analyze-stock [Company]`
```
3. Create your analysis folder structure:
```
Stock Research/
├── analyze-stock.md
├── Playbooks/          ← sector playbooks
│   ├── ecommerce.md
│   ├── enterprise-ai-infra.md
│   ├── semis.md
│   ├── private-credit.md
│   └── software-saas.md
├── Analyses/           ← per-company files (excluded from version control)
│   └── [Company]/
│       ├── notes.md
│       └── CLAUDE.md
└── .gitignore
```

To run the autonomous pipeline instead, see [`autonomous-analysis/README.md`](autonomous-analysis/README.md).

## Output

Each analysis session produces:
- `Analyses/[Company]/notes.md` — accumulated findings per pillar
- `Analyses/[Company]/CLAUDE.md` — session state (current phase, Lynch label, active pillar) so analysis can be resumed in future sessions

## Tools used

| Tool | Role |
|---|---|
| Claude (WebSearch) | Classification, qualitative analysis, quick facts |
| fiscal.ai | Financial data (provided by user) |
| NotebookLM | Earnings call analysis (provided by user) |
| Google Sheet | Reverse DCF inputs (provided by user) |
| Google Drive MCP | Read/write analysis files |

# Stock Research

A structured investment analysis framework built on top of Claude Code. Combines multiple analytical methodologies into a cohesive, step-by-step workflow for researching publicly traded companies.

## What's in here

**Skills** — Claude Code skills that drive the analysis:
- `analyze-stock.md` — the main analysis framework, invoked with `/analyze-stock [Company]`
- `stock-research.md` — autonomous web research agent powered by MiroThinker, invoked with `/stock-research [Company] [question]`

**Playbooks** — sector-specific reference guides loaded during analysis:
- `Playbooks/ecommerce.md` — e-commerce metrics, red flags, diagnostic questions

## How it works

### `/analyze-stock`

An 8-step framework that structures a full company analysis:

1. **Classification** — assigns the company (per segment) to a lifecycle phase (Startup → Hyper Growth → Self Funding → Operating Leverage → Capital Return → Decline). The phase determines which valuation methods apply and what to focus on in each subsequent step. Lynch modifiers (Cyclical, Turnaround, Asset Play) are applied on top when the phase alone doesn't capture the full picture.

2. **Deep Dive Operational** — how the business makes money, who buys, how often, pricing power, recession resilience.

3. **Moat** — five sources (network effect, switching costs, low-cost production, intangible, counterpositioning), state, and direction. Direction matters more than current state.

4. **Execution Risk** — concentration, disruption, external forces, competition, technological risk.

5. **Financial Analysis** — revenue/margin trends, segments, financial health, cash flow quality, beat/miss history, key metrics, sector-specific KPIs.

6. **Growth Potential** — TAM/SAM, growth levers (new customers, geographic expansion, new products, pricing power, M&A), organic vs bought growth.

7. **Outlook** — management guidance vs analyst consensus vs what was actually delivered. Red flags in management communication.

8. **Valuation** — phase-appropriate primary metric + secondary metrics + Reverse DCF (what is the market pricing in?) + Bull/Base/Bear scenarios built from findings in previous steps.

9. **Sentiment + Management Assessment** — bulls vs bears, analyst targets, insider activity, short interest, CEO track record, employee sentiment, shareholder alignment.

The analysis is conversational and step-by-step — you drive the pace, ask follow-up questions, and approve each step before moving forward. Questions are generated dynamically based on the company's classification, not from a fixed list.

### `/stock-research`

Runs an autonomous web research agent (MiroThinker) to verify a specific investment claim or question. Best used mid-analysis when something needs external verification — competitor data, user sentiment, regional market data, analyst commentary.

```
/stock-research Sea Limited  Is TikTok Shop taking market share from Shopee in Vietnam?
```

Before running, the agent prompt is always shown with a brief rationale. You approve before execution. Results include specific article links, not just domain names.

### Playbooks

Sector-specific guides loaded at the start of analysis when a matching sector is identified. If no playbook exists for a sector, one is researched and built during the first analysis of that type.

## Setup

### Requirements

- [Claude Code](https://claude.ai/code)
- [MiroThinker](https://github.com/MiroMindAI/MiroThinker) (for `/stock-research`)
- fiscal.ai account (for financial data)
- API keys: Gemini (LLM), Serper.dev (search), Jina.ai (scraping)

### Installation

1. Copy `analyze-stock.md` and `stock-research.md` to `~/.claude/skills/`
2. Add your API keys to `stock-research.md` (replace `YOUR_*_API_KEY` placeholders)
3. Register skills in `~/.claude/CLAUDE.md`:
```markdown
## Skills
- **analyze-stock** — Full investment analysis framework. Invoke with `/analyze-stock [Company]`
- **stock-research** — Web research agent for verifying investment claims. Invoke with `/stock-research [Company] [question]`
```
4. Create your analysis folder structure:
```
your-folder/
├── Analizy/
│   ├── Playbooks/    ← sector playbooks go here
│   └── [Company]/    ← per-company analysis files (keep out of version control)
```

## Output

Each analysis session produces:
- `Analizy/[Company]/notes.md` — accumulated findings per filar
- `Analizy/[Company]/CLAUDE.md` — session state (current phase, Lynch label, active filar) so analysis can be resumed in future sessions

## Tools used

| Tool | Role |
|---|---|
| Claude (WebSearch) | Classification, qualitative analysis, quick facts |
| fiscal.ai | Financial data (provided by user) |
| NotebookLM | Earnings call analysis (provided by user) |
| MiroThinker + Gemini | Autonomous web research |
| Serper.dev | Google Search for MiroThinker |
| Jina.ai | Web scraping for MiroThinker |

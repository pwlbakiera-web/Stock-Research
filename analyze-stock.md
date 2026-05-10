---
name: analyze-stock
description: Use when user wants to analyze a stock or company for investment purposes, start a new company analysis, continue an existing analysis, or asks to go through any analytical pillar or step of the investment framework.
---

# Analyze Stock — Investment Analysis Framework

## Overview

Structured 8-step investment analysis. User drives pace — work in small steps, await approval before moving to next. Generate questions dynamically from principles, never from a closed list. Cite sources with specific article links, not domains.

## Invocation

```
/analyze-stock [Company]
```

If company folder exists at `[your-folder]/Analizy/[Company]/`, read `CLAUDE.md` first to see current state and continue from where we left off. Otherwise start from Step 0.

## Structure

```
Step 0:   Classification
Pillar 1: Deep Dive Operational
Pillar 2: Moat
Pillar 3: Execution Risk
Pillar 4: Financial Analysis
Pillar 5: Growth Potential
Pillar 6: Outlook
Pillar 7: Valuation
Pillar 8: Sentiment + Management Assessment
```

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

Lynch modifier (only when Phase alone doesn't describe the dynamics): Cyclical → mid-cycle normalized; Turnaround → what broke, who fixes it, catalyst; Asset Play → hidden assets, who unlocks.

Output: Phase per segment + composite, Lynch modifier if applicable, valuation method, KPI focus direction ("look for metrics showing X").

## Pillars — key principles

**Pillar 1 Deep Dive Operational:** Helicopter view → revenue streams → unit economics → who buys → purchase frequency (one-time vs recurring) → pricing power → recession resilience.

**Pillar 2 Moat:** 5 sources: network effect, switching costs, low-cost production, intangible, counterpositioning. State (wide/narrow/none) + direction (widening/stable/shrinking). Direction > state.

**Pillar 3 Execution Risk:** 1) Concentration (>20% one client = red flag) 2) Disruption (disruptor vs disrupted) 3) External forces (regulatory, commodities, rates, macro) 4) Competition (margin attack vs volume attack) 5) Technological risk (speculative scenarios + early warning signals).

**Pillar 4 Financial Analysis:** Revenue/margin/profit trends → segments → financial health (debt, cash) → cashflow and earnings quality (SBC-adjusted FCF) → results vs estimates (revenue and EPS separately, priority depends on phase) → key metrics (ROIC, FCF margin) → sector-specific KPIs.

**Pillar 5 Growth Potential:** TAM/SAM + penetration → growth levers: new customers / more from existing / geography / new products / pricing power / M&A → S&M as % revenue → backlog (product ≠ service) → catalysts.

**Pillar 6 Outlook:** Management guidance (NotebookLM) → execution vs promises → analyst consensus vs guidance → red flags in communication (metric changes, vague language, recurring "transitional factors", guidance revision after Investor Day).

**Pillar 7 Valuation:** Primary metric from phase + secondary complementary metrics → Reverse DCF (data from user's Google Sheet, WACC and terminal growth rate per company) → SBC-adjusted FCF for FCF-based methods → Bull/Base/Bear (assumptions emerge from previous pillars, set case by case).

**Pillar 8 Sentiment + Management:** Sentiment: bulls vs bears / analyst consensus + revision direction / insider trading / short interest / momentum vs sector. Management: track record / execution vs promises (pattern) / SBC as % FCF / employee sentiment / skin in the game.

## Summary per pillar

At the end of each pillar: short qualitative summary — what's strong, what raises questions, what needs further investigation.

## Tools

| Tool | When |
|---|---|
| WebSearch | Classification, Pillar 1, quick facts — link to specific article |
| fiscal.ai | Precise financial data (user provides) |
| NotebookLM | Earnings calls, management comments (Pillar 6) |
| Google Sheet | Reverse DCF inputs (user provides) |
| MiroThinker | Deep research or parallel worker — `/stock-research` |
| Google Drive MCP | Read/write analysis files |

## Output

Save session results to `[your-folder]/Analizy/[Company]/notes.md`.
Update `[your-folder]/Analizy/[Company]/CLAUDE.md` (max 15 lines): phase, Lynch label, current pillar, key decisions so far.

## Sector playbooks

Check `[your-folder]/Analizy/Playbooks/[sector].md` at start. If missing: research sector KPIs → show user → await approval → seed playbook.

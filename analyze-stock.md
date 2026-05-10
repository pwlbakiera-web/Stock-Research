---
name: analyze-stock
description: Use when user wants to analyze a stock or company for investment purposes, start a new company analysis, continue an existing analysis, or asks to go through any analytical filar or step of the investment framework.
---

# Analyze Stock — Investment Analysis Framework

## Overview

Structured 8-step investment analysis. User drives pace — work in small steps, await approval before moving to next. Generate questions dynamically from principles, never from a closed list. Cite sources with specific article links, not domains.

**Full framework details:** `C:\Users\pwlba\AI design\docs\2026-05-09-analyze-stock-design.md`

## Invocation

```
/analyze-stock [Company]
```

If company folder exists at `AI design/Analizy/[Company]/`, read `CLAUDE.md` first to see current state and continue from where we left off. Otherwise start from Krok 0.

## Structure

```
Krok 0:  Klasyfikacja
Filar 1: Deep Dive Operacyjny
Filar 2: Moat
Filar 3: Execution Risk
Filar 4: Analiza Finansowa
Filar 5: Growth Potential
Filar 6: Outlook
Filar 7: Wycena
Filar 8: Sentiment + Management Assessment
```

## Krok 0: Klasyfikacja

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

## Filary — kluczowe zasady

**Filar 1 Deep Dive Operacyjny:** Helicopter view → revenue streams → unit economics → who buys → purchase frequency (one-time vs recurring) → pricing power → recession resilience.

**Filar 2 Moat:** 5 sources: network effect, switching costs, low-cost production, intangible, counterpositioning. State (wide/narrow/none) + direction (widening/stable/shrinking). Direction > state.

**Filar 3 Execution Risk:** 1) Koncentracja (>20% one client = red flag) 2) Disruption (disruptor vs disrupted) 3) Siły zewnętrzne (regulatory, commodities, rates, macro) 4) Konkurencja (margin attack vs volume attack) 5) Ryzyko technologiczne (speculative scenarios + early warning signals).

**Filar 4 Analiza Finansowa:** Trendy revenue/marż/zysków → segmenty → kondycja finansowa (dług, cash) → cashflow i jakość zysku (SBC-adjusted FCF) → wynik vs prognozy (revenue i EPS osobno, priorytet zależny od fazy) → key metrics (ROIC, FCF margin) → sector-specific KPIs.

**Filar 5 Growth Potential:** TAM/SAM + penetracja → dźwignie: nowi klienci / więcej od istniejących / geografia / nowe produkty / pricing power / M&A → S&M jako % revenue → backlog (produktowy ≠ serwisowy) → katalyzatory.

**Filar 6 Outlook:** Co mówił zarząd (NotebookLM) → wykonanie vs obietnice → konsensus analityków vs guidance → czerwone flagi komunikacyjne (zmiana metryk, ogólniki, powtarzające się "czynniki przejściowe", rewizje guidance tuż po Investor Day).

**Filar 7 Wycena:** Primary metric z fazy + secondary komplementarne → Reverse DCF (dane z Google Sheet użytkownika, WACC i terminal growth per spółka) → SBC-adjusted FCF przy FCF-based metodach → Bull/Base/Bear (założenia wyłaniają się z poprzednich filarów, każdorazowo ustalane).

**Filar 8 Sentiment + Management:** Sentiment: byki vs niedźwiedzie / analyst consensus + kierunek rewizji / insider trading / short interest / momentum vs sektor. Management: track record / execution vs obietnice (wzorzec) / SBC jako % FCF / employee sentiment / skin in the game.

## Podsumowanie per filar

Na końcu każdego filaru: krótkie jakościowe podsumowanie — co mocne, co budzi wątpliwości, co wymaga dalszego zbadania.

## Tools

| Tool | When |
|---|---|
| WebSearch | Klasyfikacja, Filar 1, quick facts — link to specific article |
| fiscal.ai | Precise financial data (user provides) |
| NotebookLM | Earnings calls, management comments (Filar 6) |
| Google Sheet | Reverse DCF inputs (user provides) |
| MiroThinker | Deep research or parallel worker — `/stock-research` |
| Google Drive MCP | Read/write analysis files |

## Output

Save session results to `AI design/Analizy/[Company]/notes.md`.
Update `AI design/Analizy/[Company]/CLAUDE.md` (max 15 lines): phase, Lynch label, current filar, key decisions so far.

## Sector playbooks

Check `AI design/Analizy/Playbooks/[sector].md` at start. If missing: research sector KPIs → show user → await approval → seed playbook.

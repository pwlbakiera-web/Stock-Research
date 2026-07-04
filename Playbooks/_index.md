# Playbooks — Index

Sector-specific KPI and metric checklists used during analysis (Financial Analysis and Valuation steps in `/analyze-stock`).

Format: one file per sector. The workflow looks for `[sector].md` at the start of an analysis.
If no playbook exists for a sector, the workflow researches the KPIs, shows them to the user for approval, and seeds a new file here.

---

## Available playbooks

- **`ecommerce.md`** — GMV, take rate, S&M as % of revenue, healthy vs. unhealthy growth patterns, network effects, sector risks (subsidy wars, social commerce, regulation)
- **`enterprise-ai-infra.md`** — servers/AI systems, networking, storage, as-a-service; units vs. ASP, AI order backlog and customer concentration, operating margin per segment, cyclical valuation modifier, memory-cycle read-through
- **`semis.md`** — semiconductors (AI picks-and-shovels); four supply-chain layers, yield as KPI #1 (~60% threshold), ecosystem lock-in (CUDA/x86/ARM), ROIC over margin (capital-intensive), capex read-through and mid-cycle valuation
- **`private-credit.md`** — private credit / BDCs / shadow lending (~$2T asset class); liquidity-vs-credit framework, KPIs (leverage, NAV/mark-vs-par, non-accruals, PIK%, ~5%/quarter gating), PIK/extend rate as a leading stress signal, gating-to-run mechanics, contagion from software-sector disruption through subordinated credit
- **`software-saas.md`** — application software/SaaS (CRM/ITSM/creative/fintech-SaaS/vertical market software); billing unit and NRR, mission-critical vs. point-solution, token pass-through and margin optics, mature-margin valuation by lifecycle phase; complementary to `enterprise-ai-infra.md`

---

## Playbook format

```markdown
# Playbook: [Sector]

## Key operating KPIs
- ...

## Unit economics / Fermi drivers
- Unit of analysis: ...
- Price/unit: ...
- Cost/unit: ...
- Utilization/frequency: ...
- Mature margin anchor: ...
- Sensitivity variables: ...

## Key financial KPIs
- ...

## Valuation metrics (sector-specific)
- ...
- If P/E doesn't apply, or the P&L is distorted by growth spending, use a Fermi model / mature-margin approach instead (see the valuation framework in `analyze-stock.md`).

## Sector-specific red flags
- ...

## Sources / benchmarks
- ...
```

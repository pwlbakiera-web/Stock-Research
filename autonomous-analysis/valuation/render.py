"""Render engine results to paste-ready English Markdown.

Style follows DOCTRINE.md "Style and report form": clean Markdown for Google Docs
export, real tables, no em-dash, lead with the number. The dagger (†) marks every
5y+ figure as a scenario artifact, not a measurement of the future (the
false-precision tax).
"""
from __future__ import annotations

DAGGER = "†"
FOOTNOTE = (
    f"\n{DAGGER} A figure from a 5+ year horizon = a scenario artifact (the output of model "
    "assumptions), not a measurement of the future. It enters the distribution of scenarios, "
    "not the paralysis of the verdict.\n"
)


def _pct(x: float, dp: int = 1) -> str:
    return f"{x * 100:.{dp}f}%"


def _usd(x: float) -> str:
    return f"{x:,.0f}"


def _bn(x_mln: float) -> str:
    """Cash figure given in mln -> 'X.Y' billions."""
    return f"{x_mln / 1000:.1f}"


def _implied_vs_actual(b: dict) -> str:
    out = ["## Implied vs actual (reverse-DCF as a read of the gap)\n"]
    out.append(
        f"The market pays {b['ev_fcf_multiple']:.1f}x EV/FCF. Reverse-DCF translates that "
        f"multiple into the implied FCF growth rate (3% terminal, 10 explicit years).\n"
    )
    out.append("| WACC | Implied FCF CAGR (10y) |")
    out.append("|---|---|")
    for r in b["wacc_table"]:
        anchor = " (anchor)" if abs(r["wacc"] - b["anchor_wacc"]) < 1e-9 else ""
        out.append(f"| {_pct(r['wacc'], 1)}{anchor} | ~{_pct(r['implied_cagr'], 0)} |")
    out.append("")
    out.append("What consensus delivers (actual), for contrast with the implied anchor:\n")
    out.append("| Period | FCF (mln) | YoY growth |")
    out.append("|---|---|---|")
    for r in b["actual_consensus"]:
        out.append(f"| {r['period']} | {_usd(r['fcf'])} | {_pct(r['growth'], 1)} |")
    out.append(f"| 2-year pace | - | ~{_pct(b['actual_2y_cagr'], 0)} |")
    out.append("")
    return "\n".join(out)


def _price_ladder(rows: list[dict]) -> str:
    out = ["## Price -> implied growth (anchor WACC, 3% terminal)\n"]
    out.append("| Price | Implied FCF CAGR |")
    out.append("|---|---|")
    for r in rows:
        out.append(f"| {r['price']:.2f} | ~{_pct(r['implied_cagr'], 0)} |")
    out.append("")
    return "\n".join(out)


def _scenario_fan(rows: list[dict], waccs: list[float]) -> str:
    out = [f"## Scenario fan (front/tail + scale sanity-check){DAGGER}\n"]
    price_cols = " | ".join(f"Price @WACC {_pct(w, 1)}" for w in waccs)
    out.append(
        f"| Scenario | Conviction | FCF CAGR{DAGGER} | FCF 2035{DAGGER} (bn) | "
        f"Revenue 2035{DAGGER} (bn) | x market | {price_cols} | vs price |"
    )
    out.append("|---|---|---|---|---|---|" + "---|" * len(waccs) + "---|")
    for r in rows:
        san = r["revenue_sanity"]
        rev = san["implied_revenue"]
        vs_mkt = san.get("vs_market_size")
        flag = " (!)" if san.get("exceeds_market") else ""
        prices = " | ".join(f"{r['prices'][w]:.0f}" for w in waccs)
        vs_anchor = r["vs_current"][waccs[0]]
        vs_mkt_str = f"x{vs_mkt:.1f}{flag}" if vs_mkt is not None else "-"
        out.append(
            f"| {r['name']} | {r['conviction']} | ~{_pct(r['cagr'], 1)} | "
            f"~{_bn(r['terminal_fcf'])} | ~{_bn(rev)} | {vs_mkt_str} | {prices} | "
            f"{'+' if vs_anchor >= 0 else ''}{_pct(vs_anchor, 0)} |"
        )
    out.append("")
    out.append(
        "The revenue column is the sanity-check: the price rises linearly with the CAGR, but "
        "the business scale needed to deliver it rises exponentially. `(!)` = the implied "
        "revenue exceeds the size of the addressable market (the scenario redefines the industry).\n"
    )
    return "\n".join(out)


def _front_tail(study: dict) -> str:
    if not study:
        return ""
    out = ["## Front/tail decomposition (same front, different tail)\n"]
    out.append(
        f"The 5-year front is fixed, averaging ~{_pct(study['front_avg'], 0)}. Only the tail "
        f"(years 6-10) changes. The tail governs value, not the front.\n"
    )
    out.append(f"| Tail variant | 10y CAGR{DAGGER} | Value @anchor WACC |")
    out.append("|---|---|---|")
    for r in study["tails"]:
        out.append(f"| {r['name']} | ~{_pct(r['cagr'], 1)} | ~{r['price']:.0f} |")
    out.append("")
    out.append(
        f"The tail alone moves value by ~{study['tail_spread']:.0f} per share. Shifting the "
        f"whole front by 2pts is only ~{study['front_shift_2pts']:.0f} per share (roughly half). "
        f"A single hot year adds once; the tail level compounds through the rest of the decade "
        "and soaks into terminal value.\n"
    )
    return "\n".join(out)


def _cross_checks(cc: dict) -> str:
    out = ["## Cross-checks\n"]
    if cc.get("peg") is not None:
        out.append(f"- PEG (forward P/E / 3y EPS CAGR): ~{cc['peg']:.2f}")
    out.append(f"- FCF yield TTM: {_pct(cc['fcf_yield_ttm'], 2)}")
    out.append(f"- FCF yield forward (FY1 consensus): {_pct(cc['fcf_yield_fwd'], 2)}")
    if cc.get("ev_ebitda_reported") is not None:
        out.append(f"- EV/EBITDA (reported): {cc['ev_ebitda_reported']:.1f}x")
    fm = cc.get("future_multiple")
    if fm:
        out.append(
            f"- Future-multiple + cash-bridge ({fm['target_label']} x {fm['mature_pe']:.0f} "
            f"mature multiple): future price ~{fm['future_price']:.0f}, "
            f"discounted to today ~{fm['pv_today']:.0f}."
        )
        if fm.get("note"):
            out.append(f"  - {fm['note']}")
    out.append("")
    return "\n".join(out)


def _midcycle(mc: dict) -> str:
    if not mc:
        return ""
    out = ["## Mid-cycle normalization\n"]
    out.append(
        f"The FCF base is inflated by a near-peak margin. After a ~{_pct(mc['haircut'], 0)} "
        f"haircut ({mc['flag']}) the implied anchor rises:\n"
    )
    out.append("| FCF base | Implied CAGR @anchor WACC |")
    out.append("|---|---|")
    out.append(f"| Reported | ~{_pct(mc['implied_reported'], 0)} |")
    out.append(f"| Mid-cycle (haircut) | ~{_pct(mc['implied_normalized'], 0)} |")
    out.append("")
    return "\n".join(out)


def _per_share(ps: dict) -> str:
    return (
        "## Per-share drain\n\n"
        f"At implied total-FCF growth ~{_pct(ps['total_fcf_growth'], 0)} and net dilution "
        f"~{_pct(ps['net_dilution'], 1)} per year, FCF per share grows ~{_pct(ps['per_share_growth'], 1)}. "
        f"That narrows the margin against the anchor further.\n"
    )


def _preprofit_markdown(result: dict) -> str:
    m = result["meta"]
    pp = result["preprofit"]
    ir = pp["implied_read"]
    out = [
        f"# Valuation of {m['ticker']} (M1, pre-profit mode) - {m['as_of']}\n",
        f"Reference price {m['price']:.2f} {m['currency']}. Amounts in {m['unit']} unless noted "
        f"otherwise. The company is unprofitable (base FCF <= 0): reverse-DCF is not feasible, "
        f"so the valuation runs on mature earnings power and multiples.\n",
        "## What the market prices in (implied)\n",
        f"- Implied mature margin (at the base multiple): ~{_pct(ir['mature_margin'], 1)} "
        f"on forward revenue {pp['forward_revenue']:.0f}.",
    ]
    if "ev_per_mw_operating" in ir:
        line = f"- Implied EV/MW: ~{ir['ev_per_mw_operating']:.2f} (operating capacity)"
        if "ev_per_mw_dev" in ir:
            line += f"; ~{ir['ev_per_mw_dev']:.2f} (incl. development)"
        out.append(line + ".")
    if "ev_per_arr_now" in ir:
        out.append(
            f"- Implied EV/ARR: ~{ir['ev_per_arr_now']:.1f}x (ARR now); "
            f"~{ir['ev_per_arr_target']:.2f}x (ARR target)."
        )
    out.append("")

    out.append(f"## Scenario fan (earnings power -> value per share){DAGGER}\n")
    out.append(f"| Scenario | Mature margin | Multiple | Value/share{DAGGER} | vs price |")
    out.append("|---|---|---|---|---|")
    for r in pp["scenario_fan"]:
        vs = r["vs_price"]
        out.append(
            f"| {r['scenario']} | {_pct(r['margin'], 0)} | {r['multiple']:.0f}x | "
            f"{r['pv_per_share']:.2f} | {'+' if vs >= 0 else ''}{_pct(vs, 0)} |"
        )
    out.append("")
    if pp.get("fermi_build"):
        fb = pp["fermi_build"]
        out.append(
            f"Fermi build (bottom-up check): {fb['effective_mw']:.0f} effective MW x "
            f"{fb['revenue'] / fb['effective_mw']:.2f} ARR/MW = revenue {fb['revenue']:.0f}, "
            f"NOPAT {fb['nopat']:.1f} -> value/share {fb['pv_per_share']:.2f} "
            f"({'+' if fb['vs_price'] >= 0 else ''}{_pct(fb['vs_price'], 0)} vs price).\n"
        )

    cc = pp["cross_checks"]
    out.append("## Checks (multiples vs peers)\n")
    out.append(f"- EV/Sales (TTM): ~{cc['ev_per_sales']:.2f}x")
    if "ev_per_gp" in cc:
        out.append(f"- EV/Gross Profit (TTM): ~{cc['ev_per_gp']:.2f}x")
    out.append("")

    out.append("## Sensitivity (mature margin x multiple -> value per share)\n")
    mults = sorted({mu for row in pp["sensitivity"] for mu in row["values"]})
    out.append("| Margin \\ multiple | " + " | ".join(f"{mu:.0f}x" for mu in mults) + " |")
    out.append("|---|" + "---|" * len(mults))
    for row in pp["sensitivity"]:
        cells = " | ".join(f"{row['values'][mu]:.2f}" for mu in mults)
        out.append(f"| {_pct(row['margin'], 0)} | {cells} |")
    out.append("")
    out.append(
        "Doctrine caveat: the mature margin is theoretical until the real profit arrives. "
        "There is no value floor if the market stops believing before the proof.\n"
    )
    out.append(FOOTNOTE)
    return "\n".join(out)


def to_markdown(result: dict) -> str:
    if result.get("mode") == "preprofit":
        return _preprofit_markdown(result)
    m = result["meta"]
    waccs = sorted(
        {row_wacc for row in result["scenario_fan"] for row_wacc in row["prices"]},
        reverse=True,
    )
    parts = [
        f"# Valuation of {m['ticker']} (M1, deterministic engine) - {m['as_of']}\n",
        f"Reference price {m['price']:.2f} {m['currency']}. Amounts in {m['unit']} unless noted "
        f"otherwise.\n",
        _implied_vs_actual(result["implied_vs_actual"]),
        _price_ladder(result["price_ladder"]),
        _scenario_fan(result["scenario_fan"], waccs),
        _front_tail(result["front_tail_study"]),
        _cross_checks(result["cross_checks"]),
        _midcycle(result["midcycle"]),
        _per_share(result["per_share"]),
    ]
    if result.get("market_size_flag"):
        parts.append(f"> Sector market size: {result['market_size_flag']}.\n")
    parts.append(FOOTNOTE)
    return "\n".join(p for p in parts if p)

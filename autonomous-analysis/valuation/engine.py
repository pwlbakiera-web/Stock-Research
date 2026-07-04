"""Assemble the full M1 valuation read from one inputs dict.

Ticker-agnostic. Everything that varies per company lives in the inputs JSON
(see valuation/README.md for the input schema). This module turns
those inputs into structured results; render.py turns results into Markdown.
"""
from __future__ import annotations

from . import dcf, preprofit


def _growth_path(scenario: dict, years: int) -> list[float]:
    """Normalize a scenario spec to an explicit per-year growth vector."""
    kind = scenario["type"]
    if kind == "flat":
        return dcf.flat_growth_path(scenario["cagr"], years)
    if kind == "front_tail":
        path = list(scenario["front"]) + list(scenario["tail"])
        if len(path) != years:
            raise ValueError(
                f"scenario '{scenario['name']}': front+tail = {len(path)} years, "
                f"expected {years}"
            )
        return path
    if kind == "path":
        path = list(scenario["fcf_growth"])
        if len(path) != years:
            raise ValueError(
                f"scenario '{scenario['name']}': path = {len(path)} years, expected {years}"
            )
        return path
    raise ValueError(f"unknown scenario type: {kind!r}")


def implied_vs_actual(inp: dict) -> dict:
    """What the market prices in (implied flat FCF CAGR) vs what consensus delivers."""
    base = inp["base_fcf_ttm"]
    ev = inp["enterprise_value"]
    years = inp["explicit_years"]
    tg = inp["terminal_growth"]

    wacc_table = [
        {"wacc": w, "implied_cagr": dcf.implied_flat_growth(ev, base, w, tg, years)}
        for w in inp["wacc_sensitivity"]
    ]

    cons_fcf = inp["consensus"]["fcf"]
    fy = sorted(cons_fcf)
    actual = []
    prev = base
    for label in fy:
        actual.append({"period": label, "fcf": cons_fcf[label], "growth": cons_fcf[label] / prev - 1.0})
        prev = cons_fcf[label]
    two_year = (cons_fcf[fy[-1]] / base) ** (1.0 / len(fy)) - 1.0

    return {
        "ev_fcf_multiple": ev / base,
        "wacc_table": wacc_table,
        "anchor_wacc": inp["wacc_anchor"],
        "actual_consensus": actual,
        "actual_2y_cagr": two_year,
    }


def price_ladder(inp: dict) -> list[dict]:
    """Each price -> the flat FCF CAGR the market would be pricing at the anchor WACC."""
    base = inp["base_fcf_ttm"]
    w = inp["wacc_anchor"]
    tg = inp["terminal_growth"]
    years = inp["explicit_years"]
    return [
        {
            "price": p,
            "implied_cagr": dcf.implied_flat_growth_for_price(
                p, base, w, tg, years, inp["net_debt"], inp["shares_diluted"]
            ),
        }
        for p in inp["price_ladder"]
    ]


def scenario_fan(inp: dict) -> list[dict]:
    """Bear -> supercycle fan: CAGR, terminal FCF, revenue sanity, price per WACC."""
    base = inp["base_fcf_ttm"]
    tg = inp["terminal_growth"]
    years = inp["explicit_years"]
    waccs = [inp["wacc_anchor"]] + [
        w for w in inp["wacc_sensitivity"] if w < inp["wacc_anchor"]
    ]
    mkt = inp.get("interconnect_market_size", {})

    rows = []
    for sc in inp["scenarios"]:
        path = _growth_path(sc, years)
        prices = {}
        terminal_fcf = None
        cagr = None
        for w in waccs:
            val = dcf.scenario_valuation(base, path, w, tg, inp["net_debt"], inp["shares_diluted"])
            prices[w] = val["price"]
            terminal_fcf = val["fcf_terminal_year"]
            cagr = val["cagr"]
        sanity = dcf.revenue_sanity(
            terminal_fcf, inp["fcf_margin"], inp["ttm_revenue"], mkt.get("value")
        )
        rows.append({
            "name": sc["name"],
            "conviction": sc.get("conviction", ""),
            "cagr": cagr,
            "terminal_fcf": terminal_fcf,
            "revenue_sanity": sanity,
            "prices": prices,
            "vs_current": {w: prices[w] / inp["price"] - 1.0 for w in waccs},
            "note": sc.get("tail_note", ""),
        })
    return rows


def front_tail_study(inp: dict) -> dict | None:
    """Hold the 5y front fixed, swap the tail -> show the tail governs value.

    Reproduces the doctrine point: a single hot year adds once; the tail level
    compounds through the rest of the decade and soaks into terminal value.
    """
    study = inp.get("front_tail_study")
    if not study:
        return None
    base = inp["base_fcf_ttm"]
    w = inp["wacc_anchor"]
    tg = inp["terminal_growth"]
    years = inp["explicit_years"]
    front = list(study["front"])

    tail_rows = []
    for tail in study["tails"]:
        path = front + list(tail["tail"])
        if len(path) != years:
            raise ValueError(f"front_tail_study tail '{tail['name']}' wrong length")
        val = dcf.scenario_valuation(base, path, w, tg, inp["net_debt"], inp["shares_diluted"])
        tail_rows.append({"name": tail["name"], "cagr": val["cagr"], "price": val["price"]})

    tail_spread = max(r["price"] for r in tail_rows) - min(r["price"] for r in tail_rows)

    # Front sensitivity: shift the whole front by -2pts, keep the central tail.
    central_tail = list(study["tails"][-1]["tail"])
    base_val = dcf.scenario_valuation(
        base, front + central_tail, w, tg, inp["net_debt"], inp["shares_diluted"]
    )
    shifted_front = [g - 0.02 for g in front]
    shifted_val = dcf.scenario_valuation(
        base, shifted_front + central_tail, w, tg, inp["net_debt"], inp["shares_diluted"]
    )
    front_spread = abs(base_val["price"] - shifted_val["price"])

    return {
        "front_avg": sum(front) / len(front),
        "tails": tail_rows,
        "tail_spread": tail_spread,
        "front_shift_2pts": front_spread,
    }


def cross_checks(inp: dict) -> dict:
    """Independent reads that should agree with the reverse-DCF picture."""
    base = inp["base_fcf_ttm"]
    mcap = inp["market_cap"]
    cons_fcf = inp["consensus"]["fcf"]
    first_fy = sorted(cons_fcf)[0]
    mult = inp.get("valuation_multiples", {})
    eps_cagr = inp["consensus"]["eps_cagr_3y"]
    out = {
        # PEG is undefined at zero/negative EPS growth - None instead of ZeroDivisionError
        "peg": dcf.peg(mult["fwd_pe"], eps_cagr) if "fwd_pe" in mult and eps_cagr > 0 else None,
        "fcf_yield_ttm": dcf.fcf_yield(base, mcap),
        "fcf_yield_fwd": dcf.fcf_yield(cons_fcf[first_fy], mcap),
        "ev_ebitda_reported": mult.get("ev_ebitda"),
    }
    fmc = inp.get("future_multiple_check")
    if fmc:
        out["future_multiple"] = {
            **dcf.future_multiple_cash_bridge(
                fmc["target_metric"] if "target_metric" in fmc else fmc["target_eps"],
                fmc["mature_pe"],
                fmc["years_out"],
                fmc["discount_rate"],
                fmc.get("net_cash_build_per_share", 0.0),
            ),
            "target_label": fmc.get("target_year_label", ""),
            "mature_pe": fmc["mature_pe"],
            "note": fmc.get("note", ""),
        }
    return out


def midcycle(inp: dict) -> dict | None:
    """Re-read implied CAGR on a margin-normalized FCF base (doctrine: value mid-cycle).

    A peak-margin FCF base understates the implied growth. Haircut the base by the
    supplied mid-cycle estimate and re-solve at the anchor WACC.
    """
    mc = inp.get("midcycle")
    if not mc:
        return None
    base = inp["base_fcf_ttm"]
    haircut = mc["fcf_haircut"]
    normalized_base = base * (1.0 - haircut)
    w = inp["wacc_anchor"]
    return {
        "haircut": haircut,
        "normalized_base": normalized_base,
        "implied_reported": dcf.implied_flat_growth(
            inp["enterprise_value"], base, w, inp["terminal_growth"], inp["explicit_years"]
        ),
        "implied_normalized": dcf.implied_flat_growth(
            inp["enterprise_value"], normalized_base, w, inp["terminal_growth"], inp["explicit_years"]
        ),
        "flag": mc.get("flag", ""),
    }


def per_share(inp: dict) -> dict:
    """Per-share FCF growth after net dilution, at the anchor implied CAGR."""
    base = inp["base_fcf_ttm"]
    implied = dcf.implied_flat_growth(
        inp["enterprise_value"], base, inp["wacc_anchor"], inp["terminal_growth"], inp["explicit_years"]
    )
    return {
        "total_fcf_growth": implied,
        "net_dilution": inp["net_dilution"],
        "per_share_growth": dcf.per_share_growth(implied, inp["net_dilution"]),
    }


def _select_mode(inp: dict) -> str:
    """auto -> preprofit when FCF base is non-positive (reverse-DCF undefined)."""
    mode = inp.get("mode", "auto")
    if mode == "auto":
        return "preprofit" if inp["base_fcf_ttm"] <= 0 else "reverse_dcf"
    return mode


def preprofit_block(inp: dict) -> dict:
    """Assemble the pre-profit read: implied (what's priced in), fan, cross-checks."""
    pp = inp["preprofit"]
    ev = inp["enterprise_value"]
    net_debt = inp["net_debt"]
    shares = inp["shares_diluted"]
    price = inp["price"]

    implied = {
        "mature_margin": preprofit.implied_mature_margin(
            ev, pp["forward_revenue"], pp["mature_multiple"]["base"],
            pp["discount_rate"], pp["years_to_mature"]
        ),
    }
    mw = pp.get("ev_per_mw")
    if mw:
        implied["ev_per_mw_operating"] = preprofit.ev_per_unit(ev, mw["mw_operating"])
        if mw.get("mw_dev"):
            implied["ev_per_mw_dev"] = preprofit.ev_per_unit(ev, mw["mw_dev"])
    arr = pp.get("ev_per_arr")
    if arr:
        implied["ev_per_arr_now"] = preprofit.ev_per_unit(ev, arr["arr_now"])
        implied["ev_per_arr_target"] = preprofit.ev_per_unit(ev, arr["arr_target"])

    cross = {"ev_per_sales": preprofit.ev_per_unit(ev, inp["ttm_revenue"])}
    if inp.get("gross_profit"):
        cross["ev_per_gp"] = preprofit.ev_per_unit(ev, inp["gross_profit"])

    fan = preprofit.scenario_fan_rows(pp, net_debt, shares)
    for row in fan:
        row["vs_price"] = row["pv_per_share"] / price - 1.0

    fermi_build = None
    if pp.get("fermi"):
        f = pp["fermi"]
        built = preprofit.fermi_earnings(
            f["capacity_mw"], f["it_load_factor"], f["arr_per_mw"],
            f["mature_margin"], f.get("tax", 0.0)
        )
        fermi_val = preprofit.backbone_value(
            built["nopat"], pp["mature_multiple"]["base"],
            pp["discount_rate"], pp["years_to_mature"], net_debt, shares
        )
        fermi_build = {**built, "pv_per_share": fermi_val["pv_per_share"],
                       "vs_price": fermi_val["pv_per_share"] / price - 1.0}

    sens = preprofit.sensitivity_grid(
        pp["forward_revenue"],
        [pp["mature_margin"][s] for s in ("bear", "base", "bull")],
        [pp["mature_multiple"][s] for s in ("bear", "base", "bull")],
        pp["discount_rate"], pp["years_to_mature"], net_debt, shares
    )

    return {
        "anchor_method": pp.get("anchor_method", "mature_margin"),
        "forward_revenue": pp["forward_revenue"],
        "implied_read": implied,
        "scenario_fan": fan,
        "fermi_build": fermi_build,
        "cross_checks": cross,
        "sensitivity": sens,
    }


def analyze(inp: dict) -> dict:
    """Run every block. The single entry point the CLI and tests call.

    Routes by mode: preprofit (base_fcf_ttm <= 0) skips the reverse-DCF blocks,
    which are undefined on a non-positive base.
    """
    meta = {
        "ticker": inp.get("ticker", ""),
        "as_of": inp.get("as_of", ""),
        "price": inp["price"],
        "currency": inp.get("currency", ""),
        "unit": inp.get("unit", ""),
    }
    mode = _select_mode(inp)
    if mode == "preprofit":
        return {"meta": meta, "mode": "preprofit", "preprofit": preprofit_block(inp)}

    result = {
        "meta": meta,
        "mode": "reverse_dcf",
        "implied_vs_actual": implied_vs_actual(inp),
        "price_ladder": price_ladder(inp),
        "scenario_fan": scenario_fan(inp),
        "front_tail_study": front_tail_study(inp),
        "cross_checks": cross_checks(inp),
        "midcycle": midcycle(inp),
        "per_share": per_share(inp),
        "market_size_flag": inp.get("interconnect_market_size", {}).get("flag", ""),
    }
    # mature-margin as a cross-check even in reverse-DCF mode (doctrine: always)
    pp = inp.get("preprofit")
    if pp and pp.get("mature_margin"):
        result["mature_margin_crosscheck"] = preprofit.scenario_fan_rows(
            pp, inp["net_debt"], inp["shares_diluted"]
        )
    return result

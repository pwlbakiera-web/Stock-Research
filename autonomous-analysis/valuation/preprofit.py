"""Deterministic pre-profit / Fermi valuation math (M1b).

Pure functions, stdlib only. Used when base_fcf_ttm <= 0 (reverse-DCF is
undefined: compounding a negative base never reaches a positive target EV) or
when mode is forced to "preprofit".

Doctrine: read what the market prices in (implied mature margin / EV-per-MW /
EV-per-ARR), then a forward scenario fan from ONE value engine, with the
multiple-based reads as standalone cross-checks.

Shared backbone (both mature-margin and Fermi anchors feed it):
    future_ev    = earnings_power * mature_multiple    # EV-based multiple
    pv_ev        = future_ev / (1 + discount_rate) ** years
    pv_per_share = (pv_ev - net_debt) / shares

Caller supplies a MATCHED (margin, multiple) pair: an EBITDA margin goes with an
EV/EBITDA multiple, a NOPAT margin with an EV/NOPAT multiple. The module does not
police the pairing; it computes honestly from what it is given.
"""
from __future__ import annotations


def backbone_value(
    earnings_power: float,
    mature_multiple: float,
    discount_rate: float,
    years: int,
    net_debt: float,
    shares: float,
) -> dict:
    """Mature earnings power -> future EV -> discounted equity per share."""
    future_ev = earnings_power * mature_multiple
    pv_ev = future_ev / (1.0 + discount_rate) ** years
    pv_equity = pv_ev - net_debt
    return {
        "earnings_power": earnings_power,
        "future_ev": future_ev,
        "pv_ev": pv_ev,
        "pv_equity": pv_equity,
        "pv_per_share": pv_equity / shares,
    }


def mature_margin_earnings(forward_revenue: float, mature_margin: float) -> float:
    """Steady-state earnings power = forward revenue * mature margin."""
    return forward_revenue * mature_margin


def implied_mature_margin(
    enterprise_value: float,
    forward_revenue: float,
    mature_multiple: float,
    discount_rate: float,
    years: int,
) -> float:
    """Invert the backbone at the EV level: what mature margin does today's EV price in?

    today_EV = future_ev / (1+d)^y  ->  future_ev_implied = EV * (1+d)^y
    future_ev = forward_revenue * margin * multiple
      => margin = EV * (1+d)^y / (forward_revenue * multiple)
    Net debt drops out: this is an EV-level read, not an equity-level one.
    """
    future_ev_implied = enterprise_value * (1.0 + discount_rate) ** years
    return future_ev_implied / (forward_revenue * mature_multiple)


def ev_per_unit(enterprise_value: float, units: float) -> float:
    """Generic EV/X ratio: X = MW, ARR, revenue, gross profit."""
    return enterprise_value / units


def fermi_earnings(
    capacity_mw: float,
    it_load_factor: float,
    arr_per_mw: float,
    mature_margin: float,
    tax: float = 0.0,
) -> dict:
    """Bottom-up NOPAT from power capacity (Fermi build).

    effective_mw = capacity * IT-load factor
    revenue      = effective_mw * ARR per MW (same cash unit as everything else)
    ebit         = revenue * mature_margin
    nopat        = ebit * (1 - tax)
    """
    effective_mw = capacity_mw * it_load_factor
    revenue = effective_mw * arr_per_mw
    ebit = revenue * mature_margin
    nopat = ebit * (1.0 - tax)
    return {
        "effective_mw": effective_mw,
        "revenue": revenue,
        "ebit": ebit,
        "nopat": nopat,
    }


def _earnings_for_scenario(preprofit_inp: dict, scenario: str) -> float:
    """Earnings power for one scenario, routed by anchor_method.

    Both anchors reuse the bear/base/bull margin: for mature_margin it scales
    forward revenue; for fermi it is the operating margin in the NOPAT build.
    """
    margin = preprofit_inp["mature_margin"][scenario]
    anchor = preprofit_inp.get("anchor_method", "mature_margin")
    if anchor == "mature_margin":
        return mature_margin_earnings(preprofit_inp["forward_revenue"], margin)
    if anchor == "fermi":
        f = preprofit_inp["fermi"]
        return fermi_earnings(
            f["capacity_mw"], f["it_load_factor"], f["arr_per_mw"], margin, f.get("tax", 0.0)
        )["nopat"]
    raise ValueError(f"unknown anchor_method: {anchor!r}")


def scenario_fan_rows(preprofit_inp: dict, net_debt: float, shares: float) -> list[dict]:
    """bear/base/bull fan through the backbone -> pv_per_share per scenario."""
    rows = []
    for scenario in ("bear", "base", "bull"):
        ep = _earnings_for_scenario(preprofit_inp, scenario)
        mult = preprofit_inp["mature_multiple"][scenario]
        val = backbone_value(
            ep, mult, preprofit_inp["discount_rate"], preprofit_inp["years_to_mature"],
            net_debt, shares,
        )
        rows.append({
            "scenario": scenario,
            "margin": preprofit_inp["mature_margin"][scenario],
            "multiple": mult,
            **val,
        })
    return rows


def sensitivity_grid(
    forward_revenue: float,
    margins: list[float],
    multiples: list[float],
    discount_rate: float,
    years: int,
    net_debt: float,
    shares: float,
) -> list[dict]:
    """Sweep the two dominant knobs (mature margin x multiple) -> pv_per_share grid."""
    grid = []
    for m in margins:
        ep = forward_revenue * m
        values = {}
        for mult in multiples:
            values[mult] = backbone_value(ep, mult, discount_rate, years, net_debt, shares)["pv_per_share"]
        grid.append({"margin": m, "values": values})
    return grid

"""Deterministic reverse-DCF + scenario valuation engine (M1).

Pure functions, standard library only. No I/O, no model calls. The whole point
of this module is that valuation is a calculator, not a judgement: identical
inputs always produce identical numbers.

Doctrine constraints baked in (see DOCTRINE.md):
- Reverse-DCF reads ONLY what the market prices in (implied-vs-actual gap). It is
  not a fair-value-to-the-dollar machine.
- Every figure on a 5y+ horizon is an artifact of explicit assumptions, never a
  measurement of the future (the false-precision tax). The renderer flags these;
  this module just computes them honestly.

Convention: all cash figures share one unit (the caller's choice, e.g. USD mln).
Growth and rates are decimals (0.18 == 18%). Per-share figures come out in the
same currency per share the price uses.
"""
from __future__ import annotations


def discount_factors(wacc: float, years: int) -> list[float]:
    """(1+wacc)^t for t = 1..years."""
    return [(1.0 + wacc) ** t for t in range(1, years + 1)]


def fcf_path_from_growth(base_fcf: float, growth_path: list[float]) -> list[float]:
    """Compound base FCF through a per-year growth vector.

    Returns one FCF value per explicit year (year 1 = base * (1+g1)).
    """
    path = []
    fcf = base_fcf
    for g in growth_path:
        fcf *= 1.0 + g
        path.append(fcf)
    return path


def flat_growth_path(cagr: float, years: int) -> list[float]:
    return [cagr] * years


def dcf_enterprise_value(
    base_fcf: float, growth_path: list[float], wacc: float, terminal_g: float
) -> dict:
    """Enterprise value = PV(explicit FCF) + PV(Gordon terminal value).

    Terminal value caps the last explicit FCF at (1+terminal_g)/(wacc-terminal_g).
    Requires wacc > terminal_g (independent of the explicit growth, which may
    legitimately exceed wacc on the explicit years).
    """
    if wacc <= terminal_g:
        raise ValueError(f"wacc ({wacc}) must exceed terminal_g ({terminal_g})")
    fcf = fcf_path_from_growth(base_fcf, growth_path)
    dfs = discount_factors(wacc, len(growth_path))
    pv_fcf = sum(f / d for f, d in zip(fcf, dfs))
    terminal_value = fcf[-1] * (1.0 + terminal_g) / (wacc - terminal_g)
    pv_terminal = terminal_value / dfs[-1]
    return {
        "ev": pv_fcf + pv_terminal,
        "fcf_path": fcf,
        "pv_fcf": pv_fcf,
        "pv_terminal": pv_terminal,
        "terminal_value": terminal_value,
    }


def realized_cagr(base_fcf: float, fcf_path: list[float]) -> float:
    """Compound annual growth of an FCF path over its full length."""
    return (fcf_path[-1] / base_fcf) ** (1.0 / len(fcf_path)) - 1.0


def implied_flat_growth(
    target_ev: float,
    base_fcf: float,
    wacc: float,
    terminal_g: float,
    years: int,
    lo: float = -0.30,
    hi: float = 1.50,
    tol: float = 1e-8,
    max_iter: int = 300,
) -> float:
    """Solve for the constant FCF CAGR that makes DCF EV == target_ev.

    EV is strictly increasing in the explicit growth, so the root is unique on
    [lo, hi]. Bisection keeps it dependency-free and exact to tol. Raises if the
    target falls outside the bracket (caller passed an impossible EV).
    """
    def ev_at(g: float) -> float:
        return dcf_enterprise_value(base_fcf, flat_growth_path(g, years), wacc, terminal_g)["ev"]

    ev_lo, ev_hi = ev_at(lo), ev_at(hi)
    if not (ev_lo <= target_ev <= ev_hi):
        raise ValueError(
            f"target_ev {target_ev:.0f} outside solvable range "
            f"[{ev_lo:.0f}, {ev_hi:.0f}] for wacc={wacc}, base_fcf={base_fcf}"
        )
    for _ in range(max_iter):
        mid = 0.5 * (lo + hi)
        if ev_at(mid) < target_ev:
            lo = mid
        else:
            hi = mid
        if hi - lo < tol:
            break
    return 0.5 * (lo + hi)


def equity_per_share(ev: float, net_debt: float, shares: float) -> float:
    """EV -> equity -> per share. The bridge that ties EV back to a price."""
    return (ev - net_debt) / shares


def scenario_valuation(
    base_fcf: float,
    growth_path: list[float],
    wacc: float,
    terminal_g: float,
    net_debt: float,
    shares: float,
) -> dict:
    """Forward DCF of one explicit growth path -> EV, equity, price, CAGR."""
    dcf = dcf_enterprise_value(base_fcf, growth_path, wacc, terminal_g)
    fcf = dcf["fcf_path"]
    return {
        "ev": dcf["ev"],
        "equity": dcf["ev"] - net_debt,
        "price": equity_per_share(dcf["ev"], net_debt, shares),
        "fcf_path": fcf,
        "fcf_terminal_year": fcf[-1],
        "cagr": realized_cagr(base_fcf, fcf),
    }


def implied_flat_growth_for_price(
    price: float,
    base_fcf: float,
    wacc: float,
    terminal_g: float,
    years: int,
    net_debt: float,
    shares: float,
) -> float:
    """Invert a share price to the flat FCF CAGR the market would be pricing in."""
    target_ev = price * shares + net_debt
    return implied_flat_growth(target_ev, base_fcf, wacc, terminal_g, years)


def revenue_sanity(
    fcf_terminal: float,
    fcf_margin: float,
    base_revenue: float | None = None,
    market_size: float | None = None,
) -> dict:
    """Scale reality check: what revenue does the terminal-year FCF imply?

    A price rises linearly with the assumed CAGR, but the business scale needed to
    deliver it rises exponentially. This converts the tail FCF back to a revenue
    line and flags when that revenue dwarfs the addressable market.
    """
    implied_revenue = fcf_terminal / fcf_margin
    out: dict = {"implied_revenue": implied_revenue}
    if base_revenue:
        out["revenue_multiple_vs_today"] = implied_revenue / base_revenue
    if market_size:
        out["vs_market_size"] = implied_revenue / market_size
        out["exceeds_market"] = implied_revenue > market_size
    return out


def per_share_growth(total_fcf_growth: float, net_dilution: float) -> float:
    """FCF-per-share growth after net share dilution drains the per-share line."""
    return (1.0 + total_fcf_growth) / (1.0 + net_dilution) - 1.0


def future_multiple_cash_bridge(
    target_metric: float,
    mature_multiple: float,
    years_out: int,
    discount_rate: float,
    net_cash_build_per_share: float = 0.0,
) -> dict:
    """Independent path to the same implied-vs-actual gap.

    Forecast a per-share metric (EPS/FCF) to a target year, apply a MATURE,
    phase-appropriate multiple (never today's peak/trough), add the cash bridge
    (cash built / debt paid / dilution), discount back to today. Catches a
    reverse-DCF that has been over-engineered.
    """
    future_price = target_metric * mature_multiple + net_cash_build_per_share
    pv_today = future_price / (1.0 + discount_rate) ** years_out
    return {"future_price": future_price, "pv_today": pv_today}


def peg(forward_pe: float, eps_cagr: float) -> float:
    """PEG = forward P/E over EPS growth expressed in points (0.238 -> 23.8)."""
    return forward_pe / (eps_cagr * 100.0)


def fcf_yield(fcf: float, market_cap: float) -> float:
    return fcf / market_cap

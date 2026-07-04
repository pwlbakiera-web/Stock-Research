"""M1 deterministic valuation engine for the autonomous-analysis workflow.

Public surface:
    engine.analyze(inputs) -> structured results
    render.to_markdown(results) -> paste-ready English Markdown
    dcf.*                        -> the pure math primitives
"""
from . import dcf, engine, render

__all__ = ["dcf", "engine", "render"]

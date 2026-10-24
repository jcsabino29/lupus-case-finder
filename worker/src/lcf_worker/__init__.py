"""Lupus Case Finder batch worker.

Loads synthetic (Synthea) records, extracts clinical entities, and writes
results to Postgres. It only ever processes synthetic data.
"""

__version__ = "0.1.0"

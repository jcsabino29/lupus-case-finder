"""Worker configuration, read from environment variables.

Secrets (database URLs) are never logged or included in repr output.
"""

from __future__ import annotations

import os
from collections.abc import Mapping
from dataclasses import dataclass, field

ALLOWED_DATA_SOURCES = frozenset({"synthea"})


class ConfigError(ValueError):
    """Raised when the worker is misconfigured. Messages never contain secrets."""


@dataclass(frozen=True)
class WorkerConfig:
    data_source: str
    database_url: str | None = field(default=None, repr=False)
    batch_size: int = 500

    @classmethod
    def from_env(cls, env: Mapping[str, str] | None = None) -> WorkerConfig:
        env = os.environ if env is None else env

        source = env.get("LCF_DATA_SOURCE", "").strip().lower()
        if source not in ALLOWED_DATA_SOURCES:
            raise ConfigError(
                "LCF_DATA_SOURCE must be 'synthea'. This project never processes real patient data."
            )

        raw_batch = env.get("LCF_BATCH_SIZE", "500")
        try:
            batch_size = int(raw_batch)
        except ValueError as exc:
            raise ConfigError("LCF_BATCH_SIZE must be an integer") from exc
        if not 1 <= batch_size <= 10_000:
            raise ConfigError("LCF_BATCH_SIZE must be between 1 and 10000")

        return cls(
            data_source=source,
            database_url=env.get("INGEST_DATABASE_URL") or None,
            batch_size=batch_size,
        )

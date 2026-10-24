"""Entry point: `python -m lcf_worker` or `lcf-worker`."""

from __future__ import annotations

import logging
import sys

from lcf_worker import __version__
from lcf_worker.config import ConfigError, WorkerConfig

log = logging.getLogger("lcf_worker")


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    try:
        config = WorkerConfig.from_env()
    except ConfigError as exc:
        log.error("%s", exc)
        return 2

    # Log counts and settings only, never record contents or connection strings.
    log.info(
        "lcf-worker %s ready (source=%s, batch_size=%d, database=%s)",
        __version__,
        config.data_source,
        config.batch_size,
        "configured" if config.database_url else "not configured",
    )
    log.info("No pipeline steps yet; extraction arrives in stage 2.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

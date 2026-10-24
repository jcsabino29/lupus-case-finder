# lcf-worker

Python batch worker for Lupus Case Finder. It runs locally or as a scheduled
GitHub Actions job, never on Vercel and never in the request path.

It refuses to start unless `LCF_DATA_SOURCE=synthea`: this project only ever
processes synthetic patients.

## Develop

```bash
cd worker
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
ruff check . && ruff format --check .
pytest
```

The clinical NLP stack (scispaCy, medspaCy, Presidio) is an optional extra,
installed in stage 2 with `pip install -e ".[nlp]"`.

## Configuration

Copy `.env.example` to `.env` (git-ignored). The worker connects as the
`ingest_worker` database role, never as the database owner.

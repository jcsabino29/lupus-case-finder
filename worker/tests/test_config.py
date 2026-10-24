import pytest

from lcf_worker.__main__ import main
from lcf_worker.config import ConfigError, WorkerConfig


def test_requires_synthetic_data_source():
    with pytest.raises(ConfigError, match="never processes real patient data"):
        WorkerConfig.from_env({})
    with pytest.raises(ConfigError):
        WorkerConfig.from_env({"LCF_DATA_SOURCE": "epic"})


def test_accepts_synthea_and_parses_batch_size():
    cfg = WorkerConfig.from_env({"LCF_DATA_SOURCE": "Synthea", "LCF_BATCH_SIZE": "250"})
    assert cfg.data_source == "synthea"
    assert cfg.batch_size == 250
    assert cfg.database_url is None


@pytest.mark.parametrize("value", ["0", "-1", "100000", "lots"])
def test_rejects_bad_batch_size(value):
    with pytest.raises(ConfigError):
        WorkerConfig.from_env({"LCF_DATA_SOURCE": "synthea", "LCF_BATCH_SIZE": value})


def test_secrets_never_appear_in_repr():
    fake_password = "not-a-real-" + "password"  # built at runtime so scanners don't flag it
    url = f"postgresql://ingest:{fake_password}@db.example.invalid:5432/postgres"
    cfg = WorkerConfig.from_env({"LCF_DATA_SOURCE": "synthea", "INGEST_DATABASE_URL": url})
    assert cfg.database_url == url
    assert fake_password not in repr(cfg)


def test_main_logs_without_leaking_secrets(monkeypatch, caplog):
    monkeypatch.setenv("LCF_DATA_SOURCE", "synthea")
    fake_password = "fake-" + "pw"
    monkeypatch.setenv("INGEST_DATABASE_URL", f"postgresql://u:{fake_password}@localhost/db")
    caplog.set_level("INFO")
    assert main() == 0
    assert fake_password not in caplog.text
    assert "database=configured" in caplog.text


def test_main_exits_nonzero_without_synthetic_source(monkeypatch):
    monkeypatch.delenv("LCF_DATA_SOURCE", raising=False)
    assert main() == 2

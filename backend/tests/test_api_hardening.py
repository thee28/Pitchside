"""Tests for the production-hardening middleware in main.py.

No database needed: every request here either short-circuits in middleware or
falls through to a 404, so nothing reaches a router.
"""

import importlib

import pytest
from fastapi.testclient import TestClient

ORIGIN = "https://pitchsidedata.app"


def _client(monkeypatch, **env) -> TestClient:
    """Re-import main with the given env so module-level config is re-read."""
    for key, value in env.items():
        monkeypatch.setenv(key, value)
    import main

    return TestClient(importlib.reload(main).app)


@pytest.fixture
def client(monkeypatch) -> TestClient:
    return _client(monkeypatch, RATE_LIMIT_PER_MIN="5", CORS_ORIGINS=ORIGIN)


def test_docs_disabled_by_default(client):
    for path in ("/docs", "/redoc", "/openapi.json"):
        assert client.get(path).status_code == 404, path


def test_docs_can_be_re_enabled(monkeypatch):
    c = _client(monkeypatch, ENABLE_DOCS="1")
    assert c.get("/openapi.json").status_code == 200


def test_rate_limit_kicks_in_after_the_cap(client):
    ip = {"CF-Connecting-IP": "203.0.113.1"}
    codes = [client.get("/api/nope", headers=ip).status_code for _ in range(7)]
    assert codes[:5] == [404] * 5
    assert codes[5:] == [429, 429]


def test_rate_limited_response_carries_retry_after(client):
    ip = {"CF-Connecting-IP": "203.0.113.2"}
    for _ in range(5):
        client.get("/api/nope", headers=ip)
    res = client.get("/api/nope", headers=ip)
    assert res.status_code == 429
    assert int(res.headers["Retry-After"]) > 0


def test_rate_limited_response_still_gets_cors_headers(client):
    """Without this the browser sees an opaque failure instead of the 429."""
    headers = {"CF-Connecting-IP": "203.0.113.3", "Origin": ORIGIN}
    for _ in range(5):
        client.get("/api/nope", headers=headers)
    res = client.get("/api/nope", headers=headers)
    assert res.status_code == 429
    assert res.headers["access-control-allow-origin"] == ORIGIN


def test_buckets_are_per_ip(client):
    noisy = {"CF-Connecting-IP": "203.0.113.4"}
    for _ in range(6):
        client.get("/api/nope", headers=noisy)
    assert client.get("/api/nope", headers=noisy).status_code == 429
    quiet = {"CF-Connecting-IP": "203.0.113.5"}
    assert client.get("/api/nope", headers=quiet).status_code == 404


def test_spoofed_forwarded_for_cannot_escape_the_bucket(client):
    """CF-Connecting-IP is edge-written, so it must win over a caller's XFF."""
    ip = "203.0.113.6"
    for i in range(6):
        client.get(
            "/api/nope",
            headers={"CF-Connecting-IP": ip, "X-Forwarded-For": f"198.51.100.{i}"},
        )
    res = client.get(
        "/api/nope",
        headers={"CF-Connecting-IP": ip, "X-Forwarded-For": "198.51.100.99"},
    )
    assert res.status_code == 429


def test_health_is_never_rate_limited(client):
    """Render's health check and the keep-warm cron must always get through."""
    ip = {"CF-Connecting-IP": "203.0.113.7"}
    for _ in range(6):
        client.get("/api/nope", headers=ip)
    assert client.get("/api/nope", headers=ip).status_code == 429
    assert [client.get("/api/health", headers=ip).status_code for _ in range(10)] == [
        200
    ] * 10


def test_cors_rejects_unknown_origins(client):
    res = client.get("/api/health", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in res.headers

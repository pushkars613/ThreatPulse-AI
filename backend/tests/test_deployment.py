from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

REPO_ROOT = Path(__file__).resolve().parents[2]


def _requirements(path: Path) -> set[str]:
    return {
        line.strip()
        for line in path.read_text().splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    }


def test_root_requirements_match_backend():
    """Railpack copies only the root requirements.txt into the pip layer, so it
    cannot '-r' into backend/. The two lists must therefore be kept identical."""
    root = _requirements(REPO_ROOT / "requirements.txt")
    backend = _requirements(REPO_ROOT / "backend" / "requirements.txt")
    assert root == backend, f"drifted: only in root={root - backend}, only in backend={backend - root}"


def test_upload_route_is_mounted_under_api():
    """The frontend defaults VITE_API_BASE_URL to '/api', so the router must be
    mounted there or every upload 404s."""
    assert client.post("/upload").status_code == 404
    assert client.post("/api/upload").status_code == 422  # route exists, file missing


def test_root_endpoint_returns_api_status():
    response = client.get("/")
    assert response.status_code == 200
    payload = response.json()
    assert payload["message"].startswith("ThreatPulse AI")


def test_health_endpoint_is_available():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

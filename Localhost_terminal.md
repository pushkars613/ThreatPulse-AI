START:  cd "YOUR_DIRECTORY_LOCATION" && .venv/bin/uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 & cd frontend && npm run dev -- --host 127.0.0.1 --port 5173

STOP:  pkill -f "uvicorn app.main:app" && pkill -f "vite dev"

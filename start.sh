#!/bin/bash
# ── Spindle Tools · Start Script ─────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo " Spindle Tools"
echo "  ─────────────────────────────────────────"

# ── Backend ──────────────────────────────────────────────────────────────────
echo "  Checking Python dependencies..."
cd "$ROOT/backend"

if ! python3 -c "import fastapi" 2>/dev/null; then
  echo "  Installing backend dependencies..."
  python3 -m pip install -r requirements.txt -q
fi

echo "  Backend  →  http://127.0.0.1:8000"
echo "  API docs →  http://127.0.0.1:8000/docs"
python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

sleep 1

# ── Frontend ─────────────────────────────────────────────────────────────────
echo ""
echo "  Installing frontend dependencies..."
cd "$ROOT/frontend"

if [ ! -d "node_modules" ]; then
  npm install -q
fi

echo "  Frontend →  http://localhost:4000"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo "  ─────────────────────────────────────────"
echo ""
npm run dev &
FRONTEND_PID=$!

# ── Cleanup on exit ───────────────────────────────────────────────────────────
trap "echo ''; echo '  Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait

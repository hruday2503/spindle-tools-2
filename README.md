# Spindle Tools — Excel ↔ JSON Converter

Standalone tool for converting logistics Excel workbooks to VRP solver JSON, and solver output JSON back to Excel reports.

**URL:** tools.spindlequantum.com (local: http://localhost:4000)

---

## Quick start

```bash
bash start.sh
```

Opens both servers automatically:
- Frontend → http://localhost:4000
- Backend  → http://127.0.0.1:8000
- API docs → http://127.0.0.1:8000/docs

---

## Manual start (two terminals)

**Terminal 1 — Backend:**
```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Project structure

```
spindle-tools/
├── start.sh                    ← one-command startup
├── README.md
│
├── frontend/
│   ├── index.html
│   ├── package.json            ← port 4000, proxies /api → :8000
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── constants/
│       │   └── index.js        ← API url, required columns, page bg
│       ├── components/
│       │   ├── SpindleLogo.jsx
│       │   └── PerspectiveLines.jsx
│       └── pages/
│           └── ToolsPage.jsx   ← entire UI (tabs, drag-drop, JSON viewer)
│
└── backend/
    ├── main.py                 ← FastAPI app, 4 endpoints
    ├── validators.py           ← checks required Excel columns
    ├── schemas.py              ← Pydantic models
    ├── requirements.txt
    ├── converters/
    │   ├── excel_to_json.py    ← Excel rows → solver JSON
    │   └── json_to_excel.py    ← solver JSON → Excel sheets
    └── templates/
        ├── vrp_template.xlsx         ← blank template
        └── vrp_template_filled.xlsx  ← 100-row sample data
```

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/` | Health check |
| POST | `/excel-to-json/` | Upload .xlsx → returns solver JSON |
| POST | `/json-to-excel/` | Upload output .json → download vrp_output.xlsx |
| GET  | `/download-template/` | Download blank vrp_template.xlsx |

---

## Excel template columns

The first sheet of your workbook must contain these columns:

| Column | Description |
|--------|-------------|
| Job Type | `delivery`, `pickup`, or `pickup_delivery` |
| Depot ID | Depot identifier |
| Depot Latitude / Longitude | Depot coordinates |
| Pickup Latitude / Longitude | Pickup location |
| Delivery Latitude / Longitude | Delivery location |
| Demand | Load/weight units |
| Time window (s) | Format: `2025-05-06T07:00:00Z - 2025-05-06T19:00:00Z` |
| Service Time | Stop duration in seconds |
| Vehicle ID | Vehicle identifier |
| Vehicle Type | e.g. `delvan_dry`, `lorry_5t` |
| Vehicle Profile | `car` or `truck` |
| Capacity | Max load units |
| Shift Start/End Time | ISO datetime strings |
| Shift Start/End Latitude/Longitude | Depot start/end coordinates |

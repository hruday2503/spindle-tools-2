from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

import pandas as pd
import json
import uuid
import os
import tempfile

from validators import validate_excel
from converters.excel_to_json import convert_excel_to_json
from converters.json_to_excel import convert_json_to_excel

app = FastAPI(title="Spindle Tools API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "message": "Spindle Tools API running"}


@app.post("/excel-to-json/")
async def excel_to_json(file: UploadFile = File(...)):
    tmp_dir   = tempfile.gettempdir()
    temp_file = os.path.join(tmp_dir, f"vrp_upload_{uuid.uuid4().hex}.xlsx")
    contents  = await file.read()

    with open(temp_file, "wb") as f:
        f.write(contents)

    try:
        excel_data = pd.read_excel(temp_file, sheet_name=None)
        validate_excel(excel_data)
        json_data = convert_excel_to_json(excel_data)
        return json_data
    except Exception as e:
        return {"error": str(e)}
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


@app.post("/json-to-excel/")
async def json_to_excel(file: UploadFile = File(...)):
    contents = await file.read()
    data     = json.loads(contents)

    tmp_dir     = tempfile.gettempdir()
    output_file = os.path.join(tmp_dir, f"vrp_output_{uuid.uuid4().hex}.xlsx")

    convert_json_to_excel(data, output_file)

    return FileResponse(
        output_file,
        filename="vrp_output.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@app.get("/download-template/")
def download_template():
    here     = os.path.dirname(os.path.abspath(__file__))
    template = os.path.join(here, "templates", "vrp_template.xlsx")
    if not os.path.exists(template):
        return {"error": "Template file not found"}
    return FileResponse(template, filename="vrp_template.xlsx")

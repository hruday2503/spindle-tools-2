import math


def clean_value(value):
    if value is None:
        return None
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
    return value


def parse_time_window(value):
    value = clean_value(value)
    if value is None:
        return [None, None]
    value = str(value).strip()
    if " - " in value:
        parts = value.split(" - ")
        if len(parts) == 2:
            return [parts[0].strip(), parts[1].strip()]
    return [value, value]


def parse_skills_list(value):
    """Parse comma-separated skills string into a clean list."""
    v = clean_value(value)
    if not v:
        return None
    return [s.strip() for s in str(v).split(",") if s.strip()]


def parse_capacity(value):
    """Capacity may come in as string or float — always return int."""
    v = clean_value(value)
    if v is None:
        return None
    try:
        return int(float(str(v).replace(",", "")))
    except (ValueError, TypeError):
        return v


def build_pickup(row):
    return {
        "places": [{
            "location": {
                "lat": clean_value(row.get("Pickup Latitude")),
                "lng": clean_value(row.get("Pickup Longitude")),
            },
            "duration": clean_value(row.get("Service Time")),
            "times": [parse_time_window(row.get("Time window (s)"))],
        }],
        "demand": [clean_value(row.get("Demand"))],
    }


def build_delivery(row):
    return {
        "places": [{
            "location": {
                "lat": clean_value(row.get("Delivery Latitude")),
                "lng": clean_value(row.get("Delivery Longitude")),
            },
            "duration": clean_value(row.get("Service Time")),
            "times": [parse_time_window(row.get("Time window (s)"))],
        }],
        "demand": [clean_value(row.get("Demand"))],
    }


def build_skills(row):
    """Build skills object from allOf / oneOf / noneOf columns."""
    skills = {}

    allof = parse_skills_list(row.get("Skills (allOf)"))
    oneof = parse_skills_list(row.get("Skills (oneOf)"))
    noneof = parse_skills_list(row.get("Skills (noneOf)"))

    if allof:
        skills["allOf"] = allof
    if oneof:
        skills["oneOf"] = oneof
    if noneof:
        skills["noneOf"] = noneof

    return skills if skills else None


def convert_excel_to_json(excel_data):

    sheet_name = list(excel_data.keys())[0]
    df = excel_data[sheet_name]
    df.columns = df.columns.str.strip()

    jobs = []
    vehicles = []

    # ── JOBS ──────────────────────────────────────────────────────────────────
    for index, row in df.iterrows():

        job_id_raw = clean_value(row.get("Job ID"))
        job_id     = str(job_id_raw) if job_id_raw else f"job_{index}"

        raw_type = str(row.get("Job Type", "")).strip().lower()

        job = {"id": job_id}

        if raw_type == "pickup":
            job["pickups"] = [build_pickup(row)]

        elif raw_type == "delivery":
            job["deliveries"] = [build_delivery(row)]

        elif raw_type in ("pickup-delivery", "pickup_delivery", "pickupdelivery"):
            job["pickups"]    = [build_pickup(row)]
            job["deliveries"] = [build_delivery(row)]

        else:
            pu_lat = clean_value(row.get("Pickup Latitude"))
            dl_lat = clean_value(row.get("Delivery Latitude"))
            if pu_lat is not None:
                job["pickups"] = [build_pickup(row)]
            if dl_lat is not None:
                job["deliveries"] = [build_delivery(row)]

        skills = build_skills(row)
        if skills:
            job["skills"] = skills

        jobs.append(job)

    # ── VEHICLES ──────────────────────────────────────────────────────────────
    unique_vehicles = df.drop_duplicates(subset=["Vehicle ID"])

    for _, row in unique_vehicles.iterrows():

        vehicle = {
            "vehicleId": clean_value(row.get("Vehicle ID")),
            "typeId":    clean_value(row.get("Vehicle Type")),
            "profile":   clean_value(row.get("Vehicle Profile")),
            "costs": {
                "fixed":    clean_value(row.get("Fixed Cost")),
                "distance": clean_value(row.get("Cost per unit distance (m)")),
                "time":     clean_value(row.get("Cost per unit time (sec)")),
            },
            "capacity": [parse_capacity(row.get("Capacity"))],
            "shifts": [{
                "start": {
                    "time": clean_value(row.get("Shift Start Time")),
                    "location": {
                        "lat": clean_value(row.get("Shift Start Latitude")),
                        "lng": clean_value(row.get("Shift Start Longitude")),
                    },
                },
                "end": {
                    "time": clean_value(row.get("Shift End Time")),
                    "location": {
                        "lat": clean_value(row.get("Shift End Latitude")),
                        "lng": clean_value(row.get("Shift End Longitude")),
                    },
                },
            }],
        }

        vehicle_skills = parse_skills_list(row.get("Skills"))
        if vehicle_skills:
            vehicle["skills"] = vehicle_skills

        vehicles.append(vehicle)

    # ── RESULT ────────────────────────────────────────────────────────────────
    return {
        "plan":  {"jobs": jobs},
        "fleet": {"vehicles": vehicles},
    }
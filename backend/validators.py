REQUIRED_COLUMNS = [

    # Job columns
    "Job Type",
    "Depot ID",
    "Depot Latitude",
    "Depot Longitude",
    "Pickup Latitude",
    "Pickup Longitude",
    "Delivery Latitude",
    "Delivery Longitude",
    "Demand",
    "Time window (s)",
    "Service Time",

    # Fleet columns
    "Vehicle ID",
    "Vehicle Type",
    "Vehicle Profile",
    "Capacity",
    "Shift Start Time",
    "Shift End Time",
    "Shift Start Latitude",
    "Shift Start Longitude",
    "Shift End Latitude",
    "Shift End Longitude"
]


def validate_excel(excel_data):

    # Take first sheet automatically
    sheet_name = list(excel_data.keys())[0]

    df = excel_data[sheet_name]

    missing = [
        col for col in REQUIRED_COLUMNS
        if col not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Missing columns: {missing}"
        )

    return True
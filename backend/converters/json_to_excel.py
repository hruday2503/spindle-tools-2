import pandas as pd


def convert_json_to_excel(data, output_file):

    # =========================
    # 1. STOPS DATA
    # =========================
    rows = []

    for tour_index, tour in enumerate(data.get("tours", [])):

        vehicle_id = tour.get("vehicleId")

        for seq, stop in enumerate(tour.get("stops", [])):

            location = stop.get("location", {})

            lat = location.get("lat")
            lng = location.get("lng")

            time_data = stop.get("time", {})

            arrival = time_data.get("arrival")
            departure = time_data.get("departure")

            distance = stop.get("distance", 0)

            load = None

            if stop.get("load"):
                load = stop.get("load")[0]

            waiting = stop.get("waiting_time", 0)

            for act in stop.get("activities", []):

                rows.append({
                    "vehicle_id": vehicle_id,

                    "tour_index": tour_index,

                    "stop_sequence": seq,

                    "job_id": act.get("jobId"),

                    "activity_type": act.get("type"),

                    "latitude": lat,
                    "longitude": lng,

                    "arrival_time_utc": arrival,
                    "departure_time_utc": departure,

                    "distance_m": distance,

                    "load": load,

                    "waiting_time_sec": waiting
                })

    df_stops = pd.DataFrame(rows)

    # =========================
    # 2. TRIP SUMMARY
    # =========================
    trip_rows = []

    for tour_index, tour in enumerate(data.get("tours", [])):

        stats = tour.get("statistic", {})

        times = stats.get("times", {})

        stops = tour.get("stops", [])

        delivery_stops = sum(
            1
            for s in stops
            for a in s.get("activities", [])
            if a.get("type") == "delivery"
        )

        pickup_stops = sum(
            1
            for s in stops
            for a in s.get("activities", [])
            if a.get("type") == "pickup"
        )

        trip_rows.append({

            "vehicle_id": tour.get("vehicleId"),

            "tour_index": tour_index,

            # KPIs
            "cost": stats.get("cost"),

            "distance_m": stats.get("distance"),

            "duration_sec": stats.get("duration"),

            # Time breakdown
            "driving_sec": times.get("driving"),

            "serving_sec": times.get("serving"),

            "waiting_sec": times.get("waiting"),

            # Stops / Jobs
            "total_stops": len(stops),

            "delivery_stops": delivery_stops,

            "pickup_stops": pickup_stops,

            "total_jobs": (
                delivery_stops +
                pickup_stops
            )
        })

    trip_df = pd.DataFrame(trip_rows)

    # =========================
    # 3. UNASSIGNED JOBS
    # =========================
    unassigned_rows = []

    for job in data.get("unassigned", []):

        unassigned_rows.append({
            "job_id": job.get("jobId"),

            "reason": job.get("reason")
        })

    unassigned_df = pd.DataFrame(unassigned_rows)

    # =========================
    # 4. SAVE EXCEL
    # =========================
    with pd.ExcelWriter(output_file) as writer:

        df_stops.to_excel(
            writer,
            sheet_name="Stops",
            index=False
        )

        trip_df.to_excel(
            writer,
            sheet_name="Trip Summary",
            index=False
        )

        unassigned_df.to_excel(
            writer,
            sheet_name="Unassigned",
            index=False
        )
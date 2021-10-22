from datetime import time
import json
from os import path


with open("./ryobi/trip_line_segments.json", "r") as f:
    data = json.load(f)

trips_list = []
for row in data:
    trip_data = {}
    trip_data["vendor"] = 0
    
    segments = row["segments"]
    timestamps = [i[2] for i in segments]
    pathes = [[i[0], i[1]]for i in segments]

    trip_data["path"] = pathes
    trip_data["timestamps"] = timestamps

    trips_list.append(trip_data)

with open("../src/ryoubi.json", "w") as f:
    json.dump(trips_list, f, ensure_ascii=False, indent=2)
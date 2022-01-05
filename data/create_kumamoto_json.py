import pandas as pd
import json

output_shapes = []

df = pd.read_csv("./dentetsu_shape.csv", encoding="shift-jis")

for route_id in df["shape_id"].unique():
    shape_dict = {}
    ex_df = df[df["shape_id"] == route_id]
    
    path = []
    timestamps = []

    for ind, (lat, lon) in enumerate(zip(ex_df["shape_pt_lat"], ex_df["shape_pt_lon"]), 1):
        path.append([lon, lat])
        timestamps.append(ind*2.5)
    shape_dict["vendor"] = 0
    shape_dict["path"] = path
    shape_dict["timestamps"] = timestamps
    output_shapes.append(shape_dict)

with open('../src/dentetsu.json', 'w') as f:
  content = json.dumps(output_shapes, ensure_ascii=False, indent=2)
  f.write(content)

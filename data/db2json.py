import sqlite3
import json

DBName = "./ryoubi.sqlite"
conn = sqlite3.connect(DBName)
cur = conn.cursor()

cur.execute("select shape_id from trips group by shape_id")
trips_shape_ids = cur.fetchall()
# print(trips_shape_ids)

shapes_list = []
for shape_id in trips_shape_ids:
    cur.execute("select * from shapes where shape_id == '" + str(shape_id[0]) + "'")
    shapes = cur.fetchall()
    
    shape_data = {}
    shape_data["vendor"] = 0
    shape_data["path"] = []
    shape_data["timestamps"] = []

    for index, shape in enumerate(shapes, 1):
        shape_data["path"].append([shape[3], shape[2]])
        shape_data["timestamps"].append(float(10.123 * index))
    
    print(shape_data)
    shapes_list.append(shape_data)

with open("../src/ryoubi.json", "w") as f:
    json.dump(shapes_list, f, ensure_ascii=False, indent=2)

    # break

cur.close()
conn.close()

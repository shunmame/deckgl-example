# ライブラリの読み込み
import pandas as pd
import json

# 時間を秒に変換する関数
def get_seconds(time_str):
    return sum(x * int(t) for x, t in zip([3600, 60, 1], time_str.split(":")))

START_TIME = get_seconds('00:00:00')
END_TIME = get_seconds('24:00:00')
MAX_TIME_VAL = 3600

def get_time_scaled(int_time):
    return ((int_time - START_TIME) / (END_TIME - START_TIME)) * MAX_TIME_VAL

# データの読み込み
shapes_df = pd.read_csv("./data/ryobi/shapes.txt")
routes_df = pd.read_csv("./data/ryobi/routes.txt")
stop_times_df = pd.read_csv("./data/ryobi/stop_times.txt")
stops_df = pd.read_csv("./data/ryobi/stops.txt")
trips_df = pd.read_csv("./data/ryobi/trips.txt")
calendar_df = pd.read_csv("./data/ryobi/calendar.txt")
calendar_dates_df = pd.read_csv("./data/ryobi/calendar_dates.txt")

# 現在適用されるcalendar_dfを表示
now_month_calendar_df = calendar_df[calendar_df["start_date"].astype(str).str.endswith("0901")]

# 平日のservice_id取得
day_service_id = now_month_calendar_df[now_month_calendar_df["monday"] == 1]["service_id"].unique().tolist()

# 平日のtrip_idを取得
trip_ids = trips_df[trips_df["service_id"].isin(day_service_id)]["trip_id"].unique().tolist()

trip_list = []
for i, trip_id in enumerate(trip_ids):
    trip_data = {}
    trip_data["vendor"] = 0
    # lat, lonを抽出
    shape_id = trips_df[trips_df["trip_id"] == trip_id]["shape_id"].values[0]
    shape = shapes_df[shapes_df["shape_id"] == shape_id][["shape_pt_lon", "shape_pt_lat"]].values.tolist()
    trip_data["path"] = shape

    # 到着時間と出発時間を秒に変更
    time_df = stop_times_df[stop_times_df["trip_id"] == trip_id]
    time_df["arrival_time"] = time_df["arrival_time"].apply(get_seconds)
    time_df["departure_time"] = time_df["departure_time"].apply(get_seconds)
    # 各点間の時間を出す
    interval_time = (time_df["arrival_time"].values[-1] - time_df["departure_time"].values[0]) / (len(shape) - 1)
    # timestampsを作成
    timestamps = [get_time_scaled((interval_time * i) + time_df["departure_time"].values[0]) for i in range(len(shape))]
    trip_data["timestamps"] = timestamps

    if len(shape) != 0:
        trip_list.append(trip_data)

    # if i == 300:
    #     break

with open('./src/ryoubi_day.json', 'w') as f:
  content = json.dumps(trip_list, ensure_ascii=False, indent=2)
  f.write(content)
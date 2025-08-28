import pandas as pd
import datetime
import s3fs
import json, os
from pyproj import Transformer

# Provide credentials with
# export AWS_ACCESS_KEY_ID=A
# export AWS_SECRET_ACCESS_KEY=5

s3 = s3fs.S3FileSystem(anon=False)

bucket = 'caltech-phoenix-data'
path = '/cleaned_data/pm10'

files = s3.ls(bucket + path)

count = len(files)

# Ensure the output directory exists
output_dir = "output_json"
os.makedirs(output_dir, exist_ok=True)

# We're just going to update the most recent month for now
files = [files[-1]]

# For each month
for filen in files:
    file_10 = s3.open(filen, 'r')
    df_pm10 = pd.read_csv(file_10)
    file_25 = s3.open(filen.replace('pm10', 'pm25'), 'r')
    df_pm25 = pd.read_csv(file_25)
    transformer = Transformer.from_crs("epsg:4326", "epsg:3857", always_xy=True)
    df_pm10['x'], df_pm10['y'] = transformer.transform(df_pm10['LON'].values, df_pm10['LAT'].values)
    df_pm25['x'], df_pm25['y'] = transformer.transform(df_pm25['LON'].values, df_pm25['LAT'].values)
    df_pm10['timestamp_local'] = pd.to_datetime(df_pm10['timestamp_local'])
    df_pm25['timestamp_local'] = pd.to_datetime(df_pm25['timestamp_local'])
    df_pm10['timestamp_str'] = df_pm10['timestamp_local'].dt.strftime('%Y-%m-%dT%H-%M-%S')
    df_pm25['timestamp_str'] = df_pm25['timestamp_local'].dt.strftime('%Y-%m-%dT%H-%M-%S')
    df_pm10['category_10'] = df_pm10['category']
    df_pm25['category_25'] = df_pm25['category']

    df_full = pd.concat([df_pm10, df_pm25], ignore_index=True)

    def nonan(x):
        return list(x.dropna())

    def unique(x):
        return list(pd.unique(x.dropna()))

    grouped = df_full.groupby("timestamp_str").agg({
    'x': unique,
    'y': unique,
    'category_10': nonan,
    'category_25': nonan,
    'pm10_rm': nonan,
    'pm25_rm': nonan,
    })

    # Iterate over each group and save as a JSON file dropna(subset=['epa_category_10','epa_category_25'])
    largest = '1900-01-01'
    for timestamp, group in grouped.iterrows():
        json_data = {
        "x": group["x"],
        "y": group["y"],
        "category_10": group["category_10"],
        "category_25": group["category_25"],
        "pm10": group["pm10_rm"],
        "pm25": group["pm25_rm"],
        }
        # Define the filename using the timestamp
        filename = f"{timestamp}.json"
        # Write the JSON file
        #with open(os.path.join(output_dir, filename), "w") as json_file:
        #We're just going to upload current date files
        today = datetime.date.today() - datetime.timedelta(1) 
        today = today.strftime("%Y-%m-%d")
        date = timestamp.split("T")[0]
        if date == today:
            if timestamp > largest:
                largest = timestamp
            with s3.open(f"{bucket}/{filename}", "w") as json_file:
                json.dump(json_data, json_file, indent=4)
        with s3.open(f"{bucket}/latest.txt", "w") as file:
            file.write(largest)

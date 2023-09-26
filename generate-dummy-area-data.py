import os
import shutil
import csv

dummyDir = "dummy"

def generateDummyAreaData(file, value):
    with open(file, "w", newline="") as f:
        writer = csv.writer(f)
        for hour in range(24):
            for min in range(60):
                writer.writerow([f"{hour:02}:{min:02}:00", value])

if os.path.isdir(dummyDir): shutil.rmtree(dummyDir)
os.makedirs(dummyDir)
generateDummyAreaData(f"{dummyDir}/aqi_upper.csv", 45)
generateDummyAreaData(f"{dummyDir}/aqi_lower.csv", 40)
generateDummyAreaData(f"{dummyDir}/temp_upper.csv", 15)
generateDummyAreaData(f"{dummyDir}/temp_lower.csv", 10)
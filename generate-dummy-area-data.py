import os
import csv

dummyDir = "dummy"

def generateDummyAreaData(file, value):
    with open(file, "w", newline="") as f:
        writer = csv.writer(f)
        for hour in range(24):
            for min in range(60):
                writer.writerow([f"{hour:02}:{min:02}:00", value])

def generateDummyAreaFile(file, value):
    try:
        os.remove(file)
    except OSError:
        pass

    generateDummyAreaData(file, value)

generateDummyAreaFile(f"{dummyDir}/aqi_upper.csv", 45)
generateDummyAreaFile(f"{dummyDir}/aqi_lower.csv", 40)
generateDummyAreaFile(f"{dummyDir}/temp_upper.csv", 15)
generateDummyAreaFile(f"{dummyDir}/temp_lower.csv", 10)
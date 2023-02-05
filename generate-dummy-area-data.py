import os
import shutil
import csv

def generateDummyAreaData(file, value):
    with open(file, 'w', newline='') as f:
        writer = csv.writer(f)
        for hour in range(24):
            for min in range(60):
                writer.writerow([f'{hour:02}:{min:02}:00', value])

if os.path.isdir('dummy-area-data'): shutil.rmtree('dummy-area-data')
os.makedirs('dummy-area-data')
generateDummyAreaData('dummy-area-data/aqi_upper.csv', 45)
generateDummyAreaData('dummy-area-data/aqi_lower.csv', 40)
generateDummyAreaData('dummy-area-data/temp_upper.csv', 15)
generateDummyAreaData('dummy-area-data/temp_lower.csv', 10)
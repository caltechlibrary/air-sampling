import boto3
import json
from decimal import *

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("air-sampling-table")


def process_value(value, measurement, item):

    mapping = {
        "CO_AQI_30": "CO_aqi",
        "AQI_30": "aqi",
        "PM2.5_AQI_30": "PM2.5_aqi",
        "O3_AQI_30": "O3_aqi",
        "NO2_AQI_30": "NO2_aqi",
        "PM10_AQI_30": "PM10_aqi",
    }

    if value != "AQI_30_PRI":
        if measurement != "nan":
            measurement = Decimal(str(measurement))
        
    if value in mapping:
        item[mapping[value]] = measurement
    else:
        item[value] = measurement



def lambda_handler(event, context):
    if event["resource"] == "/submit":
        body = json.loads(event["body"])
        item = {"date": body.pop("date")}
        for value in body:
            process_value(value,body[value],item)
        table.put_item(Item=item)
        return {"statusCode": 200, "body": json.dumps("Data accepted!")}


if __name__ == "__main__":
    with open("test.json", "r") as infile:
        data = json.load(infile)
        lambda_handler(data, "")


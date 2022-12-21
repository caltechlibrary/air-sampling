import boto3
import json
import aqi
from decimal import *

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("air-sampling-table")


def process_value(value, item, body):

    mapping = {
        "NO2": aqi.POLLUTANT_NO2_1H,
        "O3": aqi.POLLUTANT_O3_8H,
        "CO": aqi.POLLUTANT_CO_8H,
        "PM2.5": aqi.POLLUTANT_PM25,
        "PM10": aqi.POLLUTANT_PM10,
    }

    conversion = {"O3": Decimal("1000"), "CO": Decimal("1000")}

    if body[value] != "NaN":

        measurement = Decimal(str(body[value]))

        item[value] = measurement

        if value in conversion:
            measurement = measurement / conversion[value]

        if value in mapping:
            item[value + "_aqi"] = aqi.to_iaqi(mapping[value], measurement)


values = [
    "time",
    "temp",
    "pressure",
    "NOy",
    "NO",
    "NO2",
    "O3",
    "SO2",
    "CO",
    "PM2.5",
    "PM10",
]


def lambda_handler(event, context):
    if event["resource"] == "/submit":
        body = json.loads(event["body"])
        item = {"date": body["date"]}
        for value in values:
            process_value(value, item, body)
        table.put_item(Item=item)
        return {"statusCode": 200, "body": json.dumps("Data accepted!")}


if __name__ == "__main__":
    with open("test.json", "r") as infile:
        data = json.load(infile)
        lambda_handler(data, "")

import boto3
import json
from decimal import Decimal

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("air-sampling-bands")


def lambda_handler(event, context):
    if event["resource"] == "/add-air-bands":
        body = json.loads(event["body"])
        item = {"date": body.pop("date")}
        for value in body:
            item[value] = json.loads(json.dumps(body[value]), parse_float=Decimal)
        table.put_item(Item=item)
        return {"statusCode": 200, "body": json.dumps("Data accepted!")}


if __name__ == "__main__":
    with open("test.json", "r") as infile:
        data = json.load(infile)
        lambda_handler(data, "")

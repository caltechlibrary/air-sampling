import boto3
import json
import datetime
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("air-sampling-table")


def lambda_handler(event, context):
    today = datetime.date.today().isoformat()
    today = "2022-08-01"
    scan = table.query(
        KeyConditionExpression=Key("date").eq(today),
        ConsistentRead=True,
        ScanIndexForward=False,
    )
    try:
        if event["queryStringParameters"]:
            metric = event["queryStringParameters"]["graph"]
            data = ""
            for line in scan["Items"]:
                if metric not in line:
                    return {
                        "statusCode": 503,
                        "headers": {
                            "Access-Control-Allow-Headers": "Content-Type",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "OPTIONS,GET",
                        },
                    }
                time = line["time"]
                time = datetime.datetime.fromtimestamp(time).time()
                data = data + f"{time},{line[metric]}\n"
            return {
                "headers": {"Content-Type": "text/csv"},
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,GET",
                },
                "body": data,
            }
        else:
            data = scan["Items"][0]
            export = {}
            for value in data:
                if value != "date":
                    export[value] = float(data[value])
                else:
                    export[value] = data[value]
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,GET",
                },
                "body": json.dumps(export),
            }
    except IndexError:
        return {
            "statusCode": 503,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET",
            },
        }

import boto3
import json
import datetime
from boto3.dynamodb.conditions import Key
from decimal import Decimal

def decimal_serializer(obj) :
  if isinstance(obj, Decimal) :
    ratio = obj.as_integer_ratio()
    if ratio[1] == 1 :
      return int(obj)
    return float(obj)
  return obj

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("air-sampling-table")


def lambda_handler(event, context):
    today = datetime.date.today().isoformat()
    
    try:
        if event["queryStringParameters"]:
            metric = event["queryStringParameters"]["graph"]
            if metric == 'bands':
                bands = dynamodb.Table("air-sampling-bands")
                scan = bands.query(
                KeyConditionExpression=Key("date").eq(today),
                #ConsistentRead=True,
                ScanIndexForward=False
                )
                data = scan["Items"][0]
                
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "OPTIONS,GET",
                    },
                    "body": json.dumps(data,default=lambda x: decimal_serializer(x))
                    }
            else:
                scan = table.query(
                    KeyConditionExpression=Key("date").eq(today),
                    #ConsistentRead=True,
                    ScanIndexForward=False,
                    ProjectionExpression='#t,#m',
                    ExpressionAttributeNames={"#t": "time","#m":metric}
                    )
                data = ""
                for line in scan["Items"]:
                    if metric not in line:
                        value = None
                    else:
                        value = line[metric]
                    time = line["time"]
                    time = datetime.datetime.fromtimestamp(time).time()
                    data = data + f"{time},{value}\n"
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
            scan = table.query(
                KeyConditionExpression=Key("date").eq(today),
                #ConsistentRead=True,
                ScanIndexForward=False
                )
            data = scan["Items"][0]
            export = {}
            for value in data:
                if value != "date":
                    if data[value] =='nan':
                        export[value] = None
                    else:
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

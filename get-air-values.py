import boto3
import json
import datetime
from boto3.dynamodb.conditions import Key

print('Loading function')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('air-sampling-table')

def lambda_handler(event, context):
    today = datetime.date.today().isoformat()
    scan = table.query(KeyConditionExpression=Key('date').eq(today),Limit=1,ConsistentRead=True,ScanIndexForward=False)
    try:
        data = scan['Items'][0]
        export = {}
        for value in data:
            if value != 'date':
                export[value] = float(data[value])
            else:
                export[value] = data[value]
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps(export)
        }
    except IndexError:
        return {
            'statusCode': 503,
            'headers': {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            }
       }

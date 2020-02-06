import boto3
import json
from decimal import *

print('Loading function')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('air-sampling')

def lambda_handler(event, context):
    item = {
        'time': Decimal(event['time']),
        'temp': Decimal(event['temp']),
        'pressure': Decimal(event['pressure'])}
    table.put_item(Item=item)
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }


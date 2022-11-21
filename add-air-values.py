import boto3
import json
from decimal import *

print('Loading function')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('air-sampling-table')

def process_value(value, item, body):
    if body[value] != 'NaN':
        item[value] = Decimal(body[value])
        
values = ['time','temp','pressure','NOy','NO','NO2','O3','SO2','CO','PM2.5','PM10']

def lambda_handler(event, context):
    if event['resource'] =='/submit':
        body = json.loads(event['body'])
        item = {'date': body['date']}
        for value in values:
            process_value(value, item, body)
        table.put_item(Item=item)
        return {
            'statusCode': 200,
            'body': json.dumps('Data accepted!')
        }


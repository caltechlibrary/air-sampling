import boto3
import json
from decimal import *

print('Loading function')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('air-sampling-table')

def lambda_handler(event, context):
    if event['resource'] =='/submit':
        body = json.loads(event['body'])
        item = {
            'date': body['date'],
            'time': Decimal(body['time']),
            'temp': Decimal(body['temp']),
            'pressure': Decimal(body['pressure']),
            'NOy': Decimal(body['NOy']),
            'NO': Decimal(body['NO']),
            'NO2': Decimal(body['NO2']),
            'O3': Decimal(body['O3']),
            'SO2': Decimal(body['SO2']),
            'CO': Decimal(body['CO']),
            'PM2.5': Decimal(body['PM2.5']),
            'PM10': Decimal(body['PM10'])
        }
        table.put_item(Item=item)
        return {
            'statusCode': 200,
            'body': json.dumps('Data accepted!')
        }

import boto3
import json
import datetime
import aqi
from boto3.dynamodb.conditions import Key

print('Loading function')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('air-sampling-table')

def lambda_handler(event, context):
    today = datetime.date.today().isoformat()
    scan = table.query(KeyConditionExpression=Key('date').eq(today),Limit=1,ConsistentRead=True,ScanIndexForward=False)
    data = scan['Items'][0]
    export = {}
    for value in data:
        if value != 'date':
            export[value] = float(data[value])
        else:
            export[value] = data[value]
    myaqi = aqi.to_aqi([
        (aqi.POLLUTANT_PM25,export['PM2.5']),
        (aqi.POLLUTANT_PM10,export['PM10']),
        (aqi.POLLUTANT_NO2_1H,export['NO2']),
        (aqi.POLLUTANT_SO2_1H,export['SO2'])
        ])
    export['aqi'] = float(myaqi)
    return {
        'statusCode': 200,
        'body': json.dumps(export)
    }

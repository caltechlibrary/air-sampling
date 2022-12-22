Caltech Air Quality Portal
=====================================================

This repository holds the source code for the Caltech Air Quality portal.


Table of contents
-----------------

* [Introduction](#introduction)
* [Installation](#installation)
* [Usage](#usage)
* [Known issues and limitations](#known-issues-and-limitations)
* [Getting help](#getting-help)
* [Contributing](#contributing)
* [License](#license)
* [Authors and history](#authors-and-history)
* [Acknowledgments](#authors-and-acknowledgments)


Introduction
------------




Installation
------------

## Real-time data infrastructure

Create an Amazon Dynamo DB table called air-sampling-table with primary key
'date' with type string and sort key called `time` with type number. The default settings are fine. 

Then create an IAM role that allows access to the table. Click Add role, Select
Lambda, Attach AWSLambdaBasicExecutionRole policy, and call the role
air-sampling. Then select the role, click the small add inline policy box in
the upper right hand corner, pick DynamoDB as the service, search for PutItem,
and search for the ARN for the Dynamo DB table you just created. Click review
policy and set AirSamplingWriteAccess as the name.

Then go to Lambda, create a new function called get-air-values, and select the
air-sampling role. Paste the get-air-values.py script into the editor save.

For the write portion, we need to add the python-aqi dependency to lambda. I
created add-air-values directory, and then installed the dependency on
your local machine type `pip install --target ./add-air-values python-aqi`.
Once you're ready to deploy type `cd add-air-values ` and `zip -r ../deployment.zip .`.
In Lambda create a new function, making sure to add the air-sampling role.
Under the code section select "Upload from" and upload the zip file. 

Go to API Gateway, Select New API, Select REST API, call it air-sampling, and
select Edge optimized. Create a Resource with name `submit` and select API
Gateway CORS. Pick /Submit and then Add Action, pick POST and click the check
box. We're doing a Lambda integration with Lambda proxy integration and
add-air-values as the function. Click the Test button, paste the contents of 
`air-values.json` into the body field, and see if data passes through lambda and into the database.

Then create a new resource with name `get_air`, add a GET action with a Lambda
proxy integration with get-air-values as the function. Click the test buttin
and you should see the date you entered returned. If you add a query parameter
`graph=O3`, you should see data returned in a csv format.

To deploy, in API Keys create a new key with name Testing. Go back to /submit, post,
settings and check API key required. 

Go to Actions, Deploy API, create a new stage called test. Then go to Usage
Plans, Create a new plan called Air Sampling, set a rate of 10 requests per
second and 100,000 requests per day, add air-sampling with stage test, and then
attach the Testing API key we created earlier. If you go to the api stage you
should see a Invoke URL. Use this with curl to test:

`curl https://URL/test/submit -H "x-api-key: KEY" --request POST -d @input.json

Usage
-----




Known issues and limitations
----------------------------




Getting help
------------

Please raise an issue on the issue tracker in this repository


Contributing
------------

Contributions are accepted via pull request.


License
-------

Software produced by the Caltech Library is Copyright (C) 2022, Caltech.  This software is freely distributed under a BSD/MIT type license.  Please see the [LICENSE](LICENSE) file for more information.


Authors and history
---------------------------

Kian Badie wrote the portal generation process and implemented the portal styling and design
Tom Morrell wrote the real-time data workflow and coordinated the development
Vicki Chiu designed the portal interface


Acknowledgments
---------------

This work was funded by the Resnick Sustainability Institute and the California Institute of Technology Library.

<div align="center">
  <br>
  <a href="https://www.caltech.edu">
    <img width="100" height="100" src=".graphics/caltech-round.png">
  </a>
</div>

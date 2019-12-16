// First we need to import the HTTP module. This module contains all the logic for dealing with HTTP requests.
var express = require('express');
var request = require('request');
const index = require('./index');
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-2",
    endpoint: "http://localhost:8000"
});
let client = new AWS.DynamoDB();

const PORT=4390;

var app = express();
app.use(express.json())
app.use(express.urlencoded())

app.listen(PORT, async function () {
    try {
        await createDynamoTable();
    } catch (e) {
        console.error(e);
    }
    
    console.log("Example app listening on port " + PORT);
});

async function createDynamoTable() {
    var params = {
        AttributeDefinitions: [
            {
                AttributeName: "teamId",
                AttributeType: "S"
            }
        ],
        KeySchema: [
            {
                AttributeName: "teamId",
                KeyType: "HASH"
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        },
        TableName: "OSSHealth-Notifier"
    };
    await client.createTable(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
}

app.get('/', function (req, res) {
    console.log(req.body);
    res.send("NOT A CHALLENGE");
    if (req.body.challenge) {
        res.send(req.challenge);
    } else {
        res.send("NOT A CHALLENGE");
        //await index.handler(request);
    }
});

app.post('/event', async function (req, res) {
    console.log(JSON.stringify(req.body));
    if (req.body.challenge) {
        res.send(req.body.challenge);
    } else {
        try {
            res.send("200 OK");
            await index.handler(req.body);
        } catch (e) {
            console.error(e);
        }
        
    }
});

app.post('/interactive', async function (req, res) {
    try {
        res.send("200 OK");
        await index.handler(JSON.parse(req.body.payload));
    } catch (e) {
        console.error(e);
    }
});
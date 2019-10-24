const methods = {};

var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-2",
  endpoint: (process.env.ENVIRONMENT === "DEV") ? "http://localhost:8000" : null
});

let docClient = new AWS.DynamoDB.DocumentClient();

methods.setSelectedChannel = async (client, channelId) => {
  
    let teamResponse = await client.team.info();

    var params = {
      TableName: "OSSHealth-Notifier",
      Item: {
        "teamId": teamResponse.team.id,
        "postingChannel": channelId,
      }
    };

    let response = await docClient.put(params).promise();
    console.log(JSON.stringify(response));
}

methods.getTeamInfo = async (client) => {
  let teamResponse = await client.team.info();

  var params = {
    TableName: "OSSHealth-Notifier",
    Key: {
      "teamId": teamResponse.team.id
    }
  };

  let response = await docClient.get(params).promise();
  console.log(`RESPONSE: ${JSON.stringify(response)}`);
  return response;
}

module.exports = methods;

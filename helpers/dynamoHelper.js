const methods = {};
const helper = require('./helperHelper');

var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-2",
  endpoint: (process.env.ENVIRONMENT === "DEV") ? "http://localhost:8000" : null
});

let docClient = new AWS.DynamoDB.DocumentClient();

methods.createUser = async (client, slackEvent) => {
  let teamResponse = await client.team.info();
  var params = {
    TableName: table,
    Item: {
      "userID": helper.getUser(slackEvent),
      "teamID": teamResponse.team.id,
      "interestedRepos": [],
      "interestedRepoGroups": [],
    }
  };

  let response = await docClient.put(params).promise();
  console.log(response);
}

methods.getUser = async (client, slackEvent) => {
  let user = helper.getUser(slackEvent);

  var params = {
    TableName: "auggie-users",
    Key: {
      "userID": user
    }
  };

  let response = await docClient.get(params).promise();
  console.log(`host response  ${JSON.stringify(response)}`);

  

  if (response) {
    if (!response.Item.teamID) {
      let teamResponse = await client.team.info();
      var params = {
        TableName: "auggie-users",
        Key: {
          "userID": user
        },
        UpdateExpression: "set teamID = :val",
        ExpressionAttributeValues: {
          ":val": teamResponse.team.id
        },
      };

      await docClient.update(params).promise();

    }

    return response.Item;
  } else {
    console.log("User does not exist: creating");
    await methods.createUser(client, slackEvent);
    let user = await methods.getUser(client, slackEvent);
    return user;
  }
}

methods.setHost = async (client, slackEvent, host) => {

  var params = {
    TableName: "auggie-users",
    Key: {
      "userID": helper.getUser(slackEvent),
    },
    UpdateExpression: "set host = :val",
    ExpressionAttributeValues: {
      ":val": host
    },
  };

  let response = await docClient.update(params).promise();
  console.log(JSON.stringify(response));
}

methods.getAllUsers = async () => {
  var params = {
    TableName: "auggie-users"
  };

  let response = await docClient.scan(params).promise();
  console.log(response.Items);
  return response.Items;
}

methods.writeRepos = async (client, slackEvent, submission) => {
  const params = {
    TableName: "auggie-users",
    Key: {
      "userID": helper.getUser(slackEvent),
    },
    UpdateExpression: "SET #attrName = list_append(#attrName, :attrValue)",
    ExpressionAttributeNames: {
      "#attrName": "interestedRepos"
    },
    ExpressionAttributeValues: {
      ":attrValue": submission
    },
    ReturnValues: "UPDATED_NEW"
  };

  let response = await docClient.update(params).promise();
  console.log(response);
}

methods.removeRepos = async (client, slackEvent, submission) => {
  let user = await methods.getUser(slackEvent);
  let currentRGs = user.interestedRepos;
  let currentRGArray = currentRGs.split(',');

  let finalRGArray = []

  for (rg of currentRGArray) {
    let isBad = false;
    for (group of submission) {
      if (rg === group) {
        isBad = true;
      }
    }
    if (!isBad) {
      finalRGArray.push(rg);
    }
  }
  var params = {
    TableName: "auggie-users",
    Key: {
      "userID": helper.getUser(slackEvent)
    },
    UpdateExpression: "set interestedRepos = :val",
    ExpressionAttributeValues: {
      ":val": finalRGArray.join(',')
    },
  };

  await docClient.update(params).promise();

  console.log(slackEvent);

  await client.chat.postEphemeral({
    channel: helper.getChannel(slackEvent),
    user: helper.getUser(slackEvent),
    text: `You are currently tracking these Repositories:\n${finalRGArray.join(", ")}`
  });
}

methods.writeRepoGroups = async (client, slackEvent, submission) => {
  let user = await methods.getUser(slackEvent);
  let oldRepoGroups = user.interestedRepoGroups;

  if (oldRepoGroups) {
    var interestedRepoGroups = removeDuplicates(submission, oldRepoGroups);
    for (repo of interestedRepoGroups){
      repo.toUpperCase();
    }
    interestedRepoGroups = interestedRepoGroups.join(',');
  } else {
    var interestedRepoGroups = submission;
  }

  var params = {
    TableName: "auggie-users",
    Key: {
      "userID": helper.getUser(slackEvent)
    },
    UpdateExpression: "set interestedRepoGroups = :val",
    ExpressionAttributeValues: {
      ":val": interestedRepoGroups
    },
  };

  await docClient.update(params).promise();

  console.log(slackEvent);

  await client.chat.postEphemeral({
    channel: helper.getChannel(slackEvent),
    user: helper.getUser(slackEvent),
    text: `You are currently tracking these Repository Groups:\n${interestedRepoGroups.replace(",", ", ")}`
  });
}

methods.removeRepoGroups = async (client, slackEvent, submission) => {
  let user = await methods.getUser(slackEvent);
  let currentRGs = user.interestedRepoGroups;
  let currentRGArray = currentRGs.split(',');

  let finalRGArray= []

  for (rg of currentRGArray) {
    let isBad = false;
    for (group of submission) {
      if (rg === group) {
        isBad = true;
      }
    }
    if (!isBad) {
      finalRGArray.push(rg);
    }
  }
  var params = {
    TableName: "auggie-users",
    Key: {
      "userID": helper.getUser(slackEvent)
    },
    UpdateExpression: "set interestedRepoGroups = :val",
    ExpressionAttributeValues: {
      ":val": finalRGArray.join(',')
    },
  };

  await docClient.update(params).promise();

  console.log(slackEvent);

  await client.chat.postEphemeral({
    channel: helper.getChannel(slackEvent),
    user: helper.getUser(slackEvent),
    text: `You are currently tracking these Repository Groups:\n${finalRGArray.join(", ")}`
  });
}

function removeDuplicates(newSubmissions, oldSubmissions) {
  let allSubmissions = oldSubmissions.trim() + "," + newSubmissions.trim()

  return Array.from(new Set(allSubmissions.replace(/ /g, '').split(',')));
}

module.exports = methods;

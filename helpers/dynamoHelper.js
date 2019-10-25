const methods = {};
const helper = require('./helperHelper');

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
      Key: {
        "teamId": teamResponse.team.id,
      },
      UpdateExpression: "set postingChannel = :val",
      ExpressionAttributeValues: {
        ":val": channelId
      },
    };
    
    let response = await docClient.update(params).promise();
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

methods.writeRepos = async (client, slackEvent, submission) => {
  let teamResponse = await client.team.info();
  let oldRepos = await methods.getRepos(client);
  if (oldRepos) {
    var interestedRepos = removeDuplicates(submission, oldRepos).join(',');
  } else {
    var interestedRepos = submission;
  }
  
  var params = {
    TableName: "OSSHealth-Notifier",
    Key: {
      "teamId": teamResponse.team.id,
    },
    UpdateExpression: "set interestedRepos = :val",
    ExpressionAttributeValues: {
      ":val": interestedRepos
    },
  };

  await docClient.update(params).promise();
  await client.chat.postEphemeral({
    channel: helper.getChannel(slackEvent),
    user: helper.getUser(slackEvent),
    text: `You are currently tracking these Repositories:\n${interestedRepos.replace(",", ", ")}`
  });
}

methods.getRepos = async (client) => {
  let teamResponse = await client.team.info();

  var params = {
    TableName: "OSSHealth-Notifier",
    Key: {
      "teamId": teamResponse.team.id
    }
  };

  let response = await docClient.get(params).promise();
  console.log(`repo response  ${JSON.stringify(response)}`);

  if (response.Item) {
    return response.Item.interestedRepos;
  } else {
    return undefined;
  }
}

methods.writeRepoGroups = async (client, slackEvent, submission) => {
  let teamResponse = await client.team.info();
  let oldRepoGroups = await methods.getRepoGroups(client);
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
    TableName: "OSSHealth-Notifier",
    Key: {
      "teamId": teamResponse.team.id,
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

methods.getRepoGroups = async (client) => {
  let teamResponse = await client.team.info();

  var params = {
    TableName: "OSSHealth-Notifier",
    Key: {
      "teamId": teamResponse.team.id
    }
  };

  let response = await docClient.get(params).promise();
  console.log(`repo group response  ${JSON.stringify(response)}`);
  if (response.Item) {
    return response.Item.interestedRepoGroups;
  } else {
    return undefined;
  }
}

function removeDuplicates(newSubmissions, oldSubmissions) {
  let allSubmissions = oldSubmissions.trim() + "," + newSubmissions.trim()

  return Array.from(new Set(allSubmissions.replace(/ /g, '').split(',')));
}

module.exports = methods;

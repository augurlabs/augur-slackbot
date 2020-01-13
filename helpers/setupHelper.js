const methods = {};
const dynamoHelper = require('./dynamoHelper');
const components = require('./../components');
const helper = require('./helperHelper');
const model = require('./../model');
const rp = require('request-promise');

methods.handler = async (client, slackEvent, type) => {
  switch (type) {
    // case "CHANNEL_SETUP":
    //   await methods.setPostingChannel(client, slackEvent);
    //   break;
    case "REPO_SETUP":
      await methods.setInterestedRepos(client, slackEvent);
      break;
    case "GENERAL_SETUP":
      await parseAmbiguousSetupRequest(client, slackEvent);
      break;
    case "HOST_SETUP":
      await methods.chooseHost(client, slackEvent);
      break;
    default: 
      await parseAmbiguousSetupRequest(client, slackEvent);
      break;
  }
  
}

methods.chooseHost = async (client, slackEvent) => {
  let hosts = model.hostList;
  let component = components.chooseHost

  component.channel = helper.getChannel(slackEvent);
  component.user = helper.getUser(slackEvent);
  let formattedHosts = [];
  console.log(hosts);
  for (host of hosts) {
    formattedHosts.push({
      "text": {
        "type": "plain_text",
          "text": host,
            "emoji": true
      },
      "value": host
    });
  }

  component.blocks[2].accessory.options = formattedHosts;

  await client.chat.postEphemeral(component);
}

methods.hostSelected = async (client, slackEvent) => {
  const selectedHost = slackEvent.actions[0].selected_option.value

  await dynamoHelper.setHost(client, slackEvent, selectedHost);

  await client.chat.postEphemeral({
    channel: helper.getChannel(slackEvent),
    user: helper.getUser(slackEvent),
    text: `Awesome! Now that you've chosen ${slackEvent.actions[0].selected_option.value} as your host, you can ask me to setup your interested repos and repo groups to subscribe to insights.`
  });
}

methods.parseAmbiguousRepoSetupRequest = async (client, channel) => {
  // present 2 options
  // if option 1, methods.setInterestedRepos(client, channel);
  // else methods.setInterestedRepoGroups(client, channel);
}

methods.setInterestedRepos = async (client, slackEvent) => {
  console.log('setting interested repos');
  let user = await dynamoHelper.getUser(client, slackEvent);
  let host = user.host;

  if (host == undefined) {
    let component = components.setupHostConfirmation;
    component.channel = slackEvent.channel;
    component.user = slackEvent.user;

    await client.chat.postEphemeral(component);
  } else {
    let options = {
      method: 'GET',
      uri: "http://" + host + ":5000/api/unstable/repos",
      json: true
    };
    console.log(options.uri)
    let response = await rp(options);
    console.log(response);
    let repoLists = parseRepoResponse(response);
    for (repos of repoLists) {
      let component = components.chooseRepos;

      component.channel = helper.getChannel(slackEvent);
      component.user = helper.getUser(slackEvent);

      component.blocks[2].accessory.options = repos;

      await client.chat.postEphemeral(component);
    }
  }
}

function parseRepoResponse(json) {
  let repoList = [];

  for (repo of json) {
    repoList.push({
      "text": {
        "type": "plain_text",
        "text": repo.url,
        "emoji": true
      },
      "value": repo.url
    });

  }

  var size = 100; var arrayOfArrays = [];
  for (var i = 0; i < repoList.length; i += size) {
    arrayOfArrays.push(repoList.slice(i, i + size));
  }


  return arrayOfArrays;
}

function parseRGResponnse(json) {
  let rgList = [];
  for (repo of json) {
    if (!rgList.includes({
      "text": {
        "type": "plain_text",
        "text": repo.rg_name,
        "emoji": true
      },
      "value": repo.rg_name
    })) {
      rgList.push({
        "text": {
          "type": "plain_text",
          "text": repo.rg_name,
          "emoji": true
        },
        "value": repo.rg_name
      });
    }
  }

  return rgList;
}

methods.setInterestedRepoGroups = async (client, slackEvent) => {
  console.log('setting interested repos');
  let user = await dynamoHelper.getUser(client, slackEvent);
  let host = user.host;

  if (host == undefined) {
    let component = components.setupHostConfirmation;
    component.channel = slackEvent.channel;
    component.user = slackEvent.user;

    await client.chat.postEphemeral(component);
  } else {
    // Actually setup
  }
}

async function parseAmbiguousSetupRequest(client, slackEvent) {
  console.log('parsing ambiguous request');
  let component = components.setupParser
  component.channel = slackEvent.channel;
  component.user = slackEvent.user;

  await client.chat.postEphemeral(component);
}

// methods.newChannelJoin = async (client, channel) => {
//   let teamInfo = await dynamoHelper.getTeamInfo(client);

//   if (teamInfo == {}) {
//     await dynamoHelper.setSelectedChannel(client, channel);
//   }
// }

// methods.postingChannelSelected = async (client, slackEvent) => {
//   const selectedChannelId = slackEvent.actions[0].selected_option.value

//   await dynamoHelper.setSelectedChannel(client, selectedChannelId);

//   await client.chat.postEphemeral({
//     channel: helper.getChannel(slackEvent),
//     user: helper.getUser(slackEvent),
//     text: `Awesome! From now on, I'll post updates in ${slackEvent.actions[0].selected_option.text.text}`
//   });
// }
// 
// methods.setPostingChannel = async (client, slackEvent) => {
//   let goodChannels = await getChannels(client);
//   console.log(slackEvent);
//   let message = components.channelSelect;
//   message.channel = helper.getChannel(slackEvent);
//   message.user = helper.getUser(slackEvent);
//   message.blocks[2].accessory.options = goodChannels;

//   console.log(JSON.stringify(message));

//   await client.chat.postEphemeral(message);
// }

// async function getChannels(client) {
//   let allChannels = await client.conversations.list();
//   let goodChannels = [];
//   console.log(allChannels);
//   for (channel of allChannels.channels) {
//     if (channel.is_channel && channel.is_member) {
//       goodChannels.push({
//         "text": {
//           "type": "plain_text",
//           "text": `#${channel.name}`,
//           "emoji": true
//         },
//         "value": channel.id
//       });

//     }
//   }

//   return goodChannels;
// }

async function getRGs(client, slackEvent) {
  let user = await dynamoHelper.getUser(client, slackEvent);
  let interestedRepoGroups = user.interestedRepoGroups;

  let goodRGs = [];
  for (rg of interestedRepoGroups.split(",")) {
      goodRGs.push({
        "text": {
          "type": "plain_text",
          "text": rg,
          "emoji": true
        },
        "value": rg
      });
  }

  return goodRGs;
}

async function getRepos(client, slackEvent) {
  let user = await dynamoHelper.getUser(client, slackEvent);
  let interestedRepos = user.interestedRepos;

  let goodRepos = [];
  for (repo of interestedRepos.split(",")) {
    goodRepos.push({
      "text": {
        "type": "plain_text",
        "text": repo,
        "emoji": true
      },
      "value": repo
    });
  }

  return goodRepos;
}

methods.removeRepoGroup = async (client, slackEvent) => {
  let interestedRepoGroups = await getRGs(client, slackEvent);
  console.log(slackEvent);

  let message = components.removeRG
  message.channel = helper.getChannel(slackEvent);
  message.user = helper.getUser(slackEvent);
  message.blocks[2].accessory.options = interestedRepoGroups;

  console.log(JSON.stringify(message));

  await client.chat.postEphemeral(message);
}

methods.removeRepos = async (client, slackEvent) => {
  let interestedRepos = await getRepos(client, slackEvent);
  console.log(slackEvent);

  let message = components.removeRepos
  message.channel = helper.getChannel(slackEvent);
  message.user = helper.getUser(slackEvent);
  message.blocks[2].accessory.options = interestedRepos;

  console.log(JSON.stringify(message));

  await client.chat.postEphemeral(message);
}

module.exports = methods;

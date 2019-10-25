const methods = {};
const dynamoHelper = require('./dynamoHelper');
const components = require('./../components');
const helper = require('./helperHelper');

methods.handler = async (client, slackEvent, type) => {
  switch (type) {
    case "CHANNEL_SETUP":
      await methods.setPostingChannel(client, slackEvent);
      break;
    case "REPO_SETUP":
      await methods.setInterestedRepos(client, slackEvent);
      break;
    case "GENERAL_SETUP":
      await parseAmbiguousSetupRequest(client, slackEvent);
      break;
    default: 
      await parseAmbiguousSetupRequest(client, slackEvent);
      break;
  }
  
}

methods.parseAmbiguousRepoSetupRequest = async (client, channel) => {
  // present 2 options
  // if option 1, methods.setInterestedRepos(client, channel);
  // else methods.setInterestedRepoGroups(client, channel);
}

methods.setInterestedRepos = async (client, slackEvent) => {
  console.log('setting interested repos');
  let modal = components.repoInputModal

  console.log(JSON.stringify(slackEvent));
  modal.private_metadata = helper.getChannel(slackEvent);

  await client.views.open({
    trigger_id: slackEvent.trigger_id,
    view: modal
  });
}

methods.setInterestedRepoGroups = async (client, slackEvent) => {
  console.log('setting interested repos');
  let modal = components.rgInputModal

  console.log(JSON.stringify(slackEvent));
  modal.private_metadata = helper.getChannel(slackEvent);

  await client.views.open({
    trigger_id: slackEvent.trigger_id,
    view: modal
  });
}

async function parseAmbiguousSetupRequest(client, slackEvent) {
  console.log('parsing ambiguous request');
  let component = components.setupParser
  component.channel = slackEvent.channel;
  component.user = slackEvent.user;

  await client.chat.postEphemeral(component);
}

methods.newChannelJoin = async (client, channel) => {
  let teamInfo = await dynamoHelper.getTeamInfo(client);

  if (teamInfo == {}) {
    await dynamoHelper.setSelectedChannel(client, channel);
  }
}

methods.postingChannelSelected = async (client, slackEvent) => {
  const selectedChannelId = slackEvent.actions[0].selected_option.value

  await dynamoHelper.setSelectedChannel(client, selectedChannelId);

  await client.chat.postEphemeral({
    channel: helper.getChannel(slackEvent),
    user: helper.getUser(slackEvent),
    text: `Awesome! From now on, I'll post updates in ${slackEvent.actions[0].selected_option.text.text}`
  });
}

methods.setPostingChannel = async (client, slackEvent) => {
  let goodChannels = await getChannels(client);
  console.log(slackEvent);
  let message = components.channelSelect;
  message.channel = helper.getChannel(slackEvent);
  message.user = helper.getUser(slackEvent);
  message.blocks[2].accessory.options = goodChannels;

  console.log(JSON.stringify(message));

  await client.chat.postEphemeral(message);
}

async function getChannels(client) {
  let allChannels = await client.conversations.list();
  let goodChannels = [];
  console.log(allChannels);
  for (channel of allChannels.channels) {
    if (channel.is_channel && channel.is_member) {
      goodChannels.push({
        "text": {
          "type": "plain_text",
          "text": `#${channel.name}`,
          "emoji": true
        },
        "value": channel.id
      });

    }
  }

  return goodChannels;
}

module.exports = methods;

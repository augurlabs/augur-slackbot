const {
  WebClient
} = require('@slack/web-api');


const dotenv = require('dotenv');
dotenv.config();

const token = process.env.SLACK_TOKEN;
let client = new WebClient(token);
const insightHelper = require('./helpers/insightHelper');
const setupHelper = require('./helpers/setupHelper');
const dynamoHelper = require('./helpers/dynamoHelper');
const interactionHelper = require('./helpers/interactionHelper');
const components = require('./components');
const helper = require('./helpers/helperHelper');
const rp = require('request-promise');

const HTTP_OK = {
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": ""
};

exports.handler = async (event) => {
  console.log('In the function');
  console.log(event);

  if (event.challenge) {
    return event.challenge;
  } else if (event.cron) {
    console.log('not supported');
    return HTTP_OK;
  } else if (event.insight) {
    await insightHelper.handleInsightEvent(client, event);
    return HTTP_OK;
  } else if (event.type === "block_actions") {
    await handleInteraction(event);
    return HTTP_OK;
  } else if (event.type === "view_submission") {
    await handleModalSubmission(event);
  } else {
    await handleSlackEvent(event);
    return HTTP_OK;
  }
};

async function handleSlackEvent(event) {
  if (event.query) {
    var options = {
      uri: 'https://slack.com/api/oauth.access?code='
        + event.query.code +
        '&client_id=' + process.env.CLIENT_ID +
        '&client_secret=' + process.env.CLIENT_SECRET +
        '&redirect_uri=' + "",
      method: 'GET'
    }

    let response = await rp(options);
    // console.log(JSON.stringify(body));
    console.log(JSON.stringify(response));

    return event.queryStringParameters.code
  }

  let slackEvent = event.event;
  console.log(JSON.stringify(slackEvent));

  if (slackEvent === undefined) {
    return HTTP_OK;
  }

  if (slackEvent.subtype === "bot_message") {
    return HTTP_OK;
  }

  if (slackEvent.subtype === "channel_join") {
    await setupHelper.newChannelJoin(client, slackEvent.channel);
  } else if (slackEvent.type === "app_mention") {
    await handleMention(slackEvent);
  } else if (slackEvent.channel_type === "im") {
    await handleDm(slackEvent);
  }
}

async function handleMention(slackEvent) {
  // let text = slackEvent.text.toLowerCase().trim();

  // if (text.includes('setup') && text.includes('channel')) {
  //   await setupHelper.handler(client, slackEvent, "CHANNEL_SETUP");
  // } else if (text.includes('setup') && text.includes('repo')) {
  //   await setupHelper.handler(client, slackEvent, "REPO_SETUP");
  // } else if (text.includes('setup')) {
  //   await setupHelper.handler(client, slackEvent, "GENERAL_SETUP");
  // } else if (text.includes('insight')) {
  //   let rg_id = text.slice(12).match(/\d/g);
  //   await insightHelper.postInsights(client, slackEvent.channel, slackEvent.event_ts, rg_id);
  // } else if (text.includes('what') || text.includes('which')) {
  //   if (text.includes('group')) {
  //     let user = await dynamoHelper.getUser(slackEvent);
  //     let rgs = user.interestedRepoGroups;

  //     await client.chat.postEphemeral({
  //       channel: helper.getChannel(slackEvent),
  //       user: helper.getUser(slackEvent),
  //       text: `You are currently tracking these Repository Groups:\n${rgs.replace(",", ", ")}`
  //     });
  //   } else if (text.includes('repo')) {
  //     let user = await dynamoHelper.getUser(slackEvent);
  //     let repos = user.interestedRepos;
  //     // let repos = await dynamoHelper.getRepos(client);
  //     await client.chat.postEphemeral({
  //       channel: helper.getChannel(slackEvent),
  //       user: helper.getUser(slackEvent),
  //       text: `You are currently tracking these Repositories :\n${repos.replace(",", ", ")}`
  //     });
  //   }
  // } else if (text.includes('delete') || text.includes('remove')) {
  //   if (text.includes('repo group') || text.includes('group')) {
  //     await setupHelper.removeRepoGroup(client, slackEvent);
  //   } else if (text.includes('repository') || text.includes('repo')) {
  //     await setupHelper.removeRepos(client, slackEvent);
  //   } else {
  //     // Parse general remove request
  //     let component = components.generalRemove
  //     component.channel = helper.getChannel(slackEvent);
  //     component.user = helper.getUser(slackEvent);
  //     await client.chat.postEphemeral(component);
  //   }
  // }
}

async function handleDm(slackEvent) {
  let text = slackEvent.text.toLowerCase().trim();

  if (text.includes('get users')) {
    await dynamoHelper.getAllUsers();
    return;
  }

  if (text.includes('setup') && text.includes('channel')) {
    await setupHelper.handler(client, slackEvent, "CHANNEL_SETUP");
  } else if (text.includes('setup') && text.includes('repo')) {
    await setupHelper.handler(client, slackEvent, "REPO_SETUP");
  } else if (text.includes('setup') && text.includes('host')) {
    await setupHelper.handler(client, slackEvent, "HOST_SETUP");
  } else if (text.includes('setup')) {
    await setupHelper.handler(client, slackEvent, "GENERAL_SETUP");
  } else if (text.includes('insight')) {
    let rg_id = text.match(/\d/g);
    await insightHelper.postInsights(slackEvent.channel, slackEvent.event_ts, rg_id);
  } else if (text.includes('what') || text.includes('which')) {
    if (text.includes('group')) {
      let user = await dynamoHelper.getUser(client, slackEvent);
      let rgs = user.interestedRepoGroups;
      
      await client.chat.postEphemeral({
        channel: helper.getChannel(slackEvent),
        user: helper.getUser(slackEvent),
        text: `You are currently tracking these Repository Groups:\n${rgs.join('\n')}`
      });
    } else if (text.includes('repo')) {
      let user = await dynamoHelper.getUser(client, slackEvent);
      let repos = user.interestedRepos;
      
      await client.chat.postEphemeral({
        channel: helper.getChannel(slackEvent),
        user: helper.getUser(slackEvent),
        text: `You are currently tracking these Repositories : \n${repos.join('\n')}`
      });
    }
  } else if (text.includes('delete') || text.includes('remove')) {
    if (text.includes('repo group') || text.includes('group')) {
      await setupHelper.removeRepoGroup(client, slackEvent);
    } else if (text.includes('repository') || text.includes('repo')) {
      await setupHelper.removeRepos(client, slackEvent);
    } else {
      // Parse general remove request
      let component = components.generalRemove
      component.channel = helper.getChannel(slackEvent);
      component.user = helper.getUser(slackEvent);
      await client.chat.postEphemeral(component);
    }
    
  }
}

async function handleInteraction(slackEvent) {
  await interactionHelper.handler(client, slackEvent);
}

async function handleModalSubmission(slackEvent) {
  console.log("No Modal Should Occur");
}

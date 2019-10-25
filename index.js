const {
  WebClient
} = require('@slack/web-api');


const Slack = require('slack-node');
const dotenv = require('dotenv');
dotenv.config();

const token = process.env.SLACK_TOKEN;
let client = new WebClient(token);
const insightHelper = require('./helpers/insightHelper');
const setupHelper = require('./helpers/setupHelper');
const dynamoHelper = require('./helpers/dynamoHelper');


exports.handler = async (event) => {
  console.log('In the function');
  console.log(event);

  if (event.challenge) {
    return event.challenge;
  } else if (event.cron) {
    console.log('not supported');
    return {
      "statusCode": 200,
      "headers": {
        "Content-Type": "application/json"
      },
      "body": ""
    };
  } else if (event.insight) {
    await insightHelper.handleInsightEvent(client, event);
    return {
      "statusCode": 200,
      "headers": {
        "Content-Type": "application/json"
      },
      "body": ""
    };
  } else if (event.type === "block_actions") {
    await handleInteraction(event);
    return {
      "statusCode": 200,
      "headers": {
        "Content-Type": "application/json"
      },
      "body": ""
    };
  } else if (event.type === "view_submission") {
    await handleModalSubmission(event);
  } else {
    await handleSlackEvent(event);
    return {
      "statusCode": 200,
      "headers": {
        "Content-Type": "application/json"
      },
      "body": ""
    };
  }
};

async function handleSlackEvent(event) {
  let slackEvent = event.event;
  console.log(JSON.stringify(slackEvent));

  if (slackEvent.subtype === "bot_message") {
    return {
      "statusCode": 200,
      "headers": {
        "Content-Type": "application/json"
      },
      "body": ""
    };
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
  let text = slackEvent.text.toLowerCase().trim();

  if (text.includes('setup') && text.includes('channel')) {
    await setupHelper.handler(client, slackEvent, "CHANNEL_SETUP");
  } else if (text.includes('setup') && text.includes('repo')) {
    await setupHelper.handler(client, slackEvent, "REPO_SETUP");
  } else if (text.includes('setup')) {
    await setupHelper.handler(client, slackEvent, "GENERAL_SETUP");
  } else if (text.includes('insight')) {
    let rg_id = text.slice(12).match(/\d/g);
    await insightHelper.postInsights(client, slackEvent.channel, slackEvent.event_ts, rg_id);
  }
}

async function handleDm(slackEvent) {
  let text = slackEvent.text.toLowerCase().trim();

  if (text.includes('setup')) {
    await setupHelper.handler(client, slackEvent);
  } else if (text.includes('insight')) {
    let rg_id = text.match(/\d/g);
    await postInsights(slackEvent.channel, slackEvent.event_ts, rg_id);
  }
}

async function handleInteraction(slackEvent) {
  const actionId = slackEvent.actions[0].action_id;
  console.log('HANDLING INTERACTION');
  console.log(JSON.stringify(slackEvent));

  switch (actionId) {
    case "CHANNEL_SELECTION":
      await setupHelper.postingChannelSelected(client, slackEvent);
      return {
        'response_type': 'ephemeral',
        'text': '',
        'replace_original': true,
        'delete_original': true
      };
      break;
    case "CHANNEL_SETUP":
      console.log(JSON.stringify(slackEvent));
      await setupHelper.setPostingChannel(client, slackEvent);
      return {
        'response_type': 'ephemeral',
        'text': '',
        'replace_original': true,
        'delete_original': true
      };
      break;
    case "REPO_SETUP":
      await setupHelper.setInterestedRepos(client, slackEvent);
      break;
    case "RG_SETUP":
      await setupHelper.setInterestedRepoGroups(client, slackEvent);
    default:
      break;
  }
}

async function handleModalSubmission(slackEvent) {
  console.log('Handling Modal!');
  let callbackId = slackEvent.view.callback_id;
  switch (callbackId) {
    case "REPO_SUBMISSION":
      let repoSubmission = slackEvent.view.state.values.repoInput.REPO_INPUT.value.trim();
      console.log(repoSubmission);
      if (verifyRepoSubmission(repoSubmission)) {
        await dynamoHelper.writeRepos(client, slackEvent, repoSubmission);

        return {
          "statusCode": 200,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": ""
        };
      } else {
        // Return error message update thing
        return {
          "statusCode": 200,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": ""
        };
      }
      
    case "RG_SUBMISSION":
      let rgSubmission = slackEvent.view.state.values.rgInput.RG_INPUT.value.trim();
      console.log(rgSubmission);
      if (verifyRepoSubmission(rgSubmission)) {
        await dynamoHelper.writeRepoGroups(client, slackEvent, rgSubmission.replace(/ /g, ''));

        return {
          "statusCode": 200,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": ""
        };
      } else {
        // Return error message update thing
        return {
          "statusCode": 200,
          "headers": {
            "Content-Type": "application/json"
          },
          "body": ""
        };
      }
      
    default:
      return {
        "statusCode": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": ""
      };
  }
}

function verifyRepoSubmission(repoSubmission) {
  console.log(typeof repoSubmission);
  let repoArray = repoSubmission.split(',');
  for (i = 0; i < repoArray.length; i++) {
    if (repoArray.length <= 0) {
      return false;
    }
  }
  return true;
}

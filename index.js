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
const components = require('./components');
const helper = require('./helpers/helperHelper');
const rp = require('request-promise');


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

async function handleDm(slackEvent) {
  let text = slackEvent.text.toLowerCase().trim();

  if (text.includes('setup')) {
    await setupHelper.handler(client, slackEvent);
  } else if (text.includes('insight')) {
    let rg_id = text.match(/\d/g);
    await postInsights(slackEvent.channel, slackEvent.event_ts, rg_id);
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
  const actionId = slackEvent.actions[0].action_id;
  console.log('HANDLING INTERACTION');
  console.log(JSON.stringify(slackEvent));

  switch (actionId) {
    case "CHANNEL_SELECTION":
      await setupHelper.postingChannelSelected(client, slackEvent);
      await deleteEphemeral(slackEvent.response_url);
      break;
    case "CHANNEL_SETUP":
      console.log(JSON.stringify(slackEvent));
      await setupHelper.setPostingChannel(client, slackEvent);
      await deleteEphemeral(slackEvent.response_url);      
      break;
    case "REPO_SETUP":
      await setupHelper.setInterestedRepos(client, slackEvent);
      await deleteEphemeral(slackEvent.response_url);
      break;
    case "RG_SETUP": 
      await setupHelper.setInterestedRepoGroups(client, slackEvent);
      await deleteEphemeral(slackEvent.response_url);
      break;
    case "REMOVE_REPOS":
      await setupHelper.removeRepos(client, slackEvent);
      await deleteEphemeral(slackEvent.response_url);
      break;
    case "REMOVE_RGS":
      await setupHelper.removeRepoGroup(client, slackEvent);
      await deleteEphemeral(slackEvent.response_url);
      break;
    case "REPO_DELETION":
      let repos = [];
      let repoArray = slackEvent.actions[0].selected_options
      for (repo of repoArray) {
        repos.push(repo.value);
      }
      await dynamoHelper.removeRepos(client, slackEvent, repos);
      await deleteEphemeral(slackEvent.response_url);
      break;
    case "RG_DELETION":
      let rgs = [];
      let rgArray = slackEvent.actions[0].selected_options
      for (repo of rgArray) {
        rgs.push(repo.value);
      }
      await dynamoHelper.removeRepoGroups(client, slackEvent, rgs);
      await deleteEphemeral(slackEvent.response_url);
      break;
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

async function deleteEphemeral(response_url) {
  let options = {
    method: 'POST',
    uri: response_url,
    body: {
      'replace_original': true,
      'delete_original': true
    },
    json: true // Automatically stringifies the body to JSON
  };
  await rp(options);
}

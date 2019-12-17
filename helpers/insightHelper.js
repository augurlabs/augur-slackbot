const rp = require('request-promise');
const dynamoHelper = require('./dynamoHelper');

const methods = {};

methods.handleInsightEvent = async (client, event) => {
  console.log("event happening");
  console.log(JSON.stringify(event));

  let users = await dynamoHelper.getAllUsers();

  for (user of users) {
    // let interest = await checkIfInterested(client, event);
    let interest = true
    
    if (interest) {
      console.log("IS INTERESTED");

      let channelResponse = await client.im.open({
        user: user.userID
      });

      // console.log(channel);

      let message = constructSentence(event);
      await client.chat.postMessage({
        channel: channelResponse.channel.id,
        text: "*Insight Event* \n\n" + message
      });
    }
  }
  
}

function constructSentence(event) {
  if (event.field === "added" || event.field === "removed") {
    event.field = "lines " + event.field;
  }

  let value = event.value + " " + event.field;
  let percentChange = (event.value / event.units_from_mean).toFixed(0);
  let timePeriod = "90 days"
  let changeWord = (value > 0) ? "decrease" : "increase";
  let rgWord = ``;
  if (event.rg_name) {
    rgWord = `(${event.rg_name}) `;
  }
  
  let insightSentence = `There were ${value} on ${event.repo_git} ${rgWord}over the last ${timePeriod}. `;
  
  let justificationSentence = `\nThat represents a ${percentChange*100}% ${changeWord} from the mean!`;

  let fullSentence = insightSentence + justificationSentence;

  return fullSentence;
}

async function checkIfInterested(client, event) {
  // Query users host 
  // cache information
  // check to see if it includes repo/repo group

  console.log("CHECKING IF INTERESTED");
  // let teamResponse = await client.team.info();
  // let teamId = teamResponse.team.id;
  let interestedRepos = await dynamoHelper.getRepos(client);
  let interestedRepoGroups = await dynamoHelper.getRepoGroups(client);
  console.log(`interested Repos: ${interestedRepos}`);
  console.log(`interested rgs: ${interestedRepoGroups}`);
  if (interestedRepos.includes(event.repo_git) || interestedRepoGroups.includes(event.rg_name)) {
    console.log(`Interested Repos (${interestedRepos}) contains ${event.repo_git}\nOR\nInterested RepoGroups (${interestedRepoGroups}) contains ${event.rg_name}`);
    return true
  } else {
    return false;
  }
}


// ON DEMAND INSIGHT INFO  ON DEMAND INSIGHT INFO  ON DEMAND INSIGHT INFO

methods.postInsights = async (client, channel, ts, rg) => {
  let data = await getInsights(rg);

  let messageResult = await client.chat.postMessage({
    channel: channel,
    text: `Here are some interesting Augur Insights about ${data[0].rg_name} from the past 10 days `
  });

  let message = "";
  let seenRecords = {};

  for (instance of data) {
    if (seenRecords[instance.ri_metric] === undefined) {
      seenRecords[instance.ri_metric] = true;
      message += `*${instance.ri_metric}* - hereisalink.com\n`;
    }
  }

  await client.chat.postMessage({
    channel: messageResult.channel,
    text: message,
    thread_ts: messageResult.message.ts
  });
}

async function getInsights(rg) {
  rg = rg.join(',');
  console.log(typeof rg);

  let id = rg.replace(/\,/g, "");
  console.log(id);
  var options = {
    method: 'GET',
    uri: `http://augur.osshealth.io/api/unstable/repo-groups/${id}/top-insights`,
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  }

  const result = await rp(options);
  console.log(result);

  return result;
}


module.exports = methods;

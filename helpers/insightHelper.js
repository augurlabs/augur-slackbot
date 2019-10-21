const rp = require('request-promise');
const dynamoHelper = require('./dynamoHelper');

const methods = {};

methods.handleInsightEvent = async (client, event) => {
  console.log("event happening");
  console.log(JSON.stringify(event));

  let teamInfo = await dynamoHelper.getTeamInfo(client);
  let channel = teamInfo.Item.postingChannel

  await client.chat.postMessage({
    channel: channel,
    text: "There was an insight event! Thanks Gabe"
  });
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

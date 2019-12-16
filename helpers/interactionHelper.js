const dynamoHelper = require('./dynamoHelper');
const setupHelper = require('./setupHelper');

const methods = {};

methods.handler = async (client, slackEvent) => {
    const actionId = slackEvent.actions[0].action_id;
    console.log('HANDLING INTERACTION');
    console.log(JSON.stringify(slackEvent));

    switch (actionId) {
        case "CHANNEL_SELECTION":
            await setupHelper.postingChannelSelected(client, slackEvent);
            await deleteEphemeral(slackEvent.response_url);
            break;
        case "HOST_SELECTION":
            await setupHelper.hostSelected(client, slackEvent);
            await deleteEphemeral(slackEvent.response_url);
            break;
        case "REPO_SELECTION":
            let selectedRepos = [];
            let reposToAdd = slackEvent.actions[0].selected_options
            for (repo of reposToAdd) {
                selectedRepos.push(repo.value);
            }
            await dynamoHelper.writeRepos(client, slackEvent, selectedRepos);
            await deleteEphemeral(slackEvent.response_url);
            break;
        case "HOST_SETUP":
            await setupHelper.chooseHost(client, slackEvent);
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

async function deleteEphemeral(response_url) {
    let options = {
        method: 'POST',
        uri: response_url,
        body: {
            'replace_original': true,
            'delete_original': true
        },
        json: true 
    };
    await rp(options);
}

module.exports = methods;
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

// methods.modalHandler = async (client, slackEvent) => {
//     console.log('Handling Modal!');
//     let callbackId = slackEvent.view.callback_id;
//     switch (callbackId) {
//         case "REPO_SUBMISSION":
//             let repoSubmission = slackEvent.view.state.values.repoInput.REPO_INPUT.value.trim();
//             console.log(repoSubmission);
//             if (verifyRepoSubmission(repoSubmission)) {
//                 await dynamoHelper.writeRepos(client, slackEvent, repoSubmission);

//                 return HTTP_OK;
//             } else {
//                 // Return error message update thing
//                 return HTTP_OK;
//             }

//         case "RG_SUBMISSION":
//             let rgSubmission = slackEvent.view.state.values.rgInput.RG_INPUT.value.trim();
//             console.log(rgSubmission);
//             if (verifyRepoSubmission(rgSubmission)) {
//                 await dynamoHelper.writeRepoGroups(client, slackEvent, rgSubmission.replace(/ /g, ''));
//                 print("Returning a 200 OK");
//                 return {
//                     "statusCode": 200,
//                     "headers": {
//                         "Content-Type": "application/json"
//                     },
//                     "body": ""
//                 };
//             } else {
//                 print("returning a 200 OK but invalid input");
//                 // Return error message update thing
//                 return HTTP_OK;
//             }

//         default:
//             return HTTP_OK;
//     }
// }

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

// function verifyRepoSubmission(repoSubmission) {
//     console.log(typeof repoSubmission);
//     let repoArray = repoSubmission.split(',');
//     for (i = 0; i < repoArray.length; i++) {
//         if (repoArray.length <= 0) {
//             return false;
//         }
//     }
//     return true;
// }

module.exports = methods;
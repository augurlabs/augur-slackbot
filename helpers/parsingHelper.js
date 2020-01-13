const methods = {};

methods.parse = (text, client, slackEvent) => {
    
    if (text.includes('setup')) {
        setupParse(text, client, slackEvent);
    }else if (text.includes('insight')) {
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

function setupParse(text, client, slackEvent) {
    
    if (text.includes('repo group') 
    || text.includes(' rg ')
    || text.includes('group')
    || text.includes('repository group')) {
        await setupHelper.setInterestedRepoGroups(client, slackEvent);
        return;
    }

    else if (text.includes('repo ')
    || text.includes('repository')) {
        await setupHelper.setInterestedRepos(client, slackEvent);
        return;
    }

    else if (text.includes('host')) {
        await setupHelper.chooseHost(client, slackEvent);
        return;
    }
    
}


module.exports = methods;


const methods = {}

methods.getChannel = (slackEvent) => {
    if (slackEvent.type === "view_submission") {
        return slackEvent.view.private_metadata;
    } else if (slackEvent.channel.id) {
        return slackEvent.channel.id;
    } else if (slackEvent.channel) {
        return slackEvent.channel;
    }
}

methods.getUser = (slackEvent) => {
    if (slackEvent.user.id) {
        return slackEvent.user.id;
    } else if (slackEvent.user) {
        return slackEvent.user;
    } else if (slackEvent.event.user) {
        return slackEvent.event.user;
    }
}

module.exports = methods;
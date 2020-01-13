const methods = {};
const components = require('./../components');

methods.handleGeneral = async (client, slackEvent, text) => {
    if (greetingCheck(text)) {
        let component = components.greeting;
        component.channel = slackEvent.channel;
        component.user = slackEvent.user;

        await client.chat.postEphemeral(component);
    }
}

function greetingCheck(text) {
    if (text.includes('hi') 
    || text.includes('hello') 
    || text.includes('hey') 
    || text.includes('good morning') 
    || text.includes('good evening') 
    || text.includes('good afternoon')
    || text.includes('howdy') 
    || text.includes('hola') 
    || text.includes('nice to meet you') 
    || text.includes('bonjour')
    || text.includes('salve') 
    || text.includes('ciao') 
    || text.includes('guten tag') 
    || text.includes('shalom')
    || text.includes('salutations')) {
        return true;
    } else {
        return false;
    }
}


module.exports = methods;
# Development Instructions

## Table of Contents
1. [Setup ngrok Environment](https://api.slack.com/tutorials/tunneling-with-ngrok)
2. [Create Slack App](https://api.slack.com/apps)
    1. Copy Permissions
    2. Add ngrok request urls
4. Create .env file in root directory
    1. add SLACK_TOKEN and SIGNING_SECRET
3. [Local Dynamo](https://medium.com/@vschroeder/install-a-local-dynamodb-development-database-on-your-machine-82dc38d59503)
    1. This works with zsh right now, not sure about bash


## Ngrok Setup

We utilize ngrok to allow for local development without access to the Augur AWS account. ngrok will create a tunnel on your network allowing for HTTP Requests to be sent to your localhost.
### *macOS/Linux*
1. Download [ngrok](https://ngrok.com/download) 
2. Extract to your $PATH
  
### *Windows*
lol

Done!

## Register Development Slack App
In order to develop for the Augur Slack App, you will need to create your own "dev" copy that will mimic all permissions of the production Slack App. This will allow for easy PR integrations without breaking anything.  
### *Creating the App*
1. Go to https://api.slack.com/apps
2. Click "Create New App"
3. Give it a name and choose your desired development workspace

### *Mimicing Settings*
1. Select "Bot Users" on the left and create a bot user.
2. Select "OAuth & Permissions". Scroll Down to "Scopes" and add the following scopes:
- im:history
- channels:read
- groups:read
- im:read
- mpim:read
- team:read
- chat:write:user
- chat:write:bot
### *Integration with ngrok*
For this step, you will need to repeat everytime you restart your ngrok tunnel (assuming you are using a free account). For Slack to communicate with our bot, we need to provide it with request urls for different event types. Currently, Augur utilizes Event Subscriptions and Interactive Components.   

Start up ngrok by typing `ngrok http 4390` in your terminal. Copy the url that is labeled "Forwarding". This is your base url.

Select "Interactive Components" and enable Interactivity. Paste in this url under request url and append `/interactive`. It should look something like `http://{random_id}.ngrok.io/interactive`. Save your changes and you're done here.

Select "Event Subscriptions" and enable Events. Paste in the url again, this time appending `/event`. It should look something like `http://{random_id}.ngrok.io/event`. Slack will initially reject your url, but don't worry, we'll fix this in a bit.

Expand the "Subscribe to Bot Events" section and add the following bot events:
- app_mention
- message.channels
- message.im

## Configuring Your Dev Environment
Now you'll need to actually begin development!   
Run these commmands:  
`git clone https://github.com/augurlabs/augur-slackbot.git`  
`cd augur-slackbot`  
`npm install`  
`node ngrok-index.js`  

Now go back to your Slack App and select "retry" next to your Event Subscription request url. Make sure ngrok and the bot are running.

Everything should now be setup on Slack's end!

### *Authentication*
You'll now need to grab your OAuth access token from the Slack page. Go to "OAuth & Permissions" again and install your app to a workspace. Then copy your OAuth Access Token (the one that starts with xoxp). 

Back in the project, create a new file in the root directory called `.env`. In this file, add `SLACK_TOKEN="xoxp-{YOUR_TOKEN}"` and `ENVIRONMENT="DEV"` on separate lines. Your bot will now be able to respond to messages.

### *Creating Your Local DynamoDB*
In order to develop any features that would utilize our database, you'll need to create a local copy that mimics its functionality. A more fleshed out description of this process can be found [here](https://medium.com/@vschroeder/install-a-local-dynamodb-development-database-on-your-machine-82dc38d59503) 

Run these commands 
```bash
wget http://dynamodb-local.s3-website-us-west-2.amazonaws.com/dynamodb_local_latest.tar.gz  
gunzip dynamodb_local_latest.tar.gz  
mkdir ./dynamolocal  
tar -jxvf dynamodb_local_latest.tar -c ./dynamolocal
cd ./dynamolocal
java -Djava.library.path=./DynamoDBLocal_lib/ -jar DynamoDBLocal.jar
```
Add this shortcut command to your terminal's profile 
```bash
function dynamo(){
 cd ~/dynamolocal
 java -Djava.library.path=./DynamoDBLocal_lib/ -jar DynamoDBLocal.jar
}
```


## How to Develop
`ngrok http 4390`  (Update urls at api.slack.com)   
`dynamo `   
`node ngrok-index.js  `

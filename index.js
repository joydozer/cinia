// OS & Node Utillity Module
const sys = require('util')
const exec = require('child_process').exec;
const os = require('os');

// Discord Auth
const Discord = require('discord.js');
const {
	prefix,
	token,
} = require('./config.json');
const client = new Discord.Client();

// Dialogflow Auth
const projectId = 'YOUR PROJECT ID OF GCP';
const sessionId = '123456789';
const languageCode = 'en'
const dialogflow = require('@google-cloud/dialogflow');
const sessionClient = new dialogflow.SessionsClient();

//The arguments for Dialogflow
//TODO: Create a loop for the end-user in Discord for it to send the message to Dialogflow
//Dialogflow will process it and send it through the API
//queries: Arguments/commands for the Dialogflow to process, below is for testing!
//const queries = ['Who are you?']

/*
||		Dialogflow API Detecting Response
||		Here's the function below
||		And it'll be used to detect response from the Dialogflow API
*/

async function detectIntent(
  projectId,
  sessionId,
  query,
  contexts,
  languageCode
) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

//For testing it, by calling it early before it connects to Discord API
//executeQueries(projectId, sessionId, queries, languageCode);

/*
||		DISCORD FAILED AND SUCCESS CONNECT
*/

// If Successfully connected/ready 
client.once('ready', () => {
	client.user.setActivity("With Weiß");
	var timeLog = new Date();
	console.log('Ready!');
});

// If the Bot needs to reconnects
client.once('reconnecting', () => {
	client.user.setActivity("Reconnecting");
	var timeLog = new Date();
	console.log('Reconnecting!');
});

// If the Bot disconnected
client.once('disconnect', () => {
	var timeLog = new Date();
	console.log('Disconnected!');
});

client.on('message', async message => {
	
	//Function for Dialogflow API Sending and Receiving Responses
	async function executeQueries(projectId, sessionId, queries, languageCode) {
	// Keeping the context across queries let's us simulate an ongoing conversation with the bot
		let context;
		let intentResponse;
		for (const query of queries) {
			try {
				//console.log(`Sending Query: ${query}`);
				intentResponse = await detectIntent(
					projectId,
					sessionId,
					query,
					context,
					languageCode
			);
			//console.log('Detected intent');
			//console.log(`Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`);
			// Use the context from this response for next queries
			context = intentResponse.queryResult.outputContexts;
			message.channel.send(`${intentResponse.queryResult.fulfillmentText}`);
			} catch (error) {
				console.log(error);
			}
		}
	}
	if(message.author.bot) return;
	if(message.content.includes("Cinia") || message.content.includes("cinia") || message.content.includes("Cinia,") || message.content.includes("cinia,")) {
		const dialogflowArgument = message.content.split(/ +/);
		dialogflowArgument.toLowerCase;
		if(!dialogflowArgument.indexOf('cinia') > 0 || !dialogflowArgument.indexOf('Cinia') > 0) dialogflowArgument.shift();
		else if(dialogflowArgument.indexOf('cinia') > 0 || dialogflowArgument.indexOf('cinia?') > 0 || dialogflowArgument.indexOf('cinia!') > 0) dialogflowArgument.pop();
		const dialogflowArguments = dialogflowArgument.join(" ");
		const dialogflowQueries = [dialogflowArguments]
		//console.log(dialogflowArguments);
		//console.log(dialogflowQueries);
		executeQueries(projectId, sessionId, dialogflowQueries, languageCode);
		
	} else if(message.content.startsWith(`${prefix}dc`)) {
			if(`${message.author}` === '<@286825508220436481>') {
			return client.destroy();
		} else {
			return message.channel.send("Only my darling can use this command! :<")
		}
	}
	
});

client.login(token);

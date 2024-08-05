const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(process.env.DISCORD_WEBHOOK);

hook.setUsername('MapsNotIncluded API');
 
hook.send("New Instance!");

module.exports = hook;
// Load up the discord.js library
const Discord = require("discord.js");

const meeseeks = require('./meeseeks.js');
const slap = require('./slap.js');
const fart = require('./fart.js');
const help = require('./help.js');
const meow = require('./meow.js');
const bark = require('./bark.js');
const mb = require('./mb.js');

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.js");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Serving ${client.guilds.size} servers`);

  //Add commands 
  help.add_command(meeseeks.help_info());
  help.add_command(slap.help_info());
  help.add_command(fart.help_info());
  help.add_command(meow.help_info());
  help.add_command(bark.help_info());
  help.add_command(mb.help_info());
});

client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;


  if(meeseeks(message)) {
    return;
  }

  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
 

  slap(command, args, message);
  fart(command, args, message);
  help(command, message); 
  meow(command, message);
  bark(command, message);
  mb(command, args, message);
});

client.login(config.token);

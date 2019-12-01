// Load up the discord.js library
const Discord = require("discord.js");
const congo = require('./bot-conglomorate.js');

const commandList = [];
const commandList2 = require('./commands.js').commands;

commandList.push(require('./poll.js'));
const help = require('./help.js');
commandList.push(help);

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
  client.user.setActivity(`${client.guilds.size} servers for fools`);

  //Add commands 
  for(var i=0;i<commandList.length;i++) {
    help.add_command(commandList[i].help_info());
  }
  
  for(var i=0;i<commandList2.length;i++) {
    congo.help(commandList2[i].command)
      .then( res => help.add_command(res));
  }
  
});

client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.

  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;


  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;

  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();


  for(var i=0;i<commandList.length;i++) {
   commandList[i].execute(command, args, message);
  }
  
  for(let cmd of commandList2) {
    if(cmd.command === command) {
      congo.execute(command, cmd.args + args.toString(), message);
      break;
    }
  }
  
});

client.login(config.token)
  .catch(console.error);

client.on('error', (error) => console.log(error));
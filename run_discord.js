let DEBUG=false

var TARGET_GUILD="";
if (DEBUG)
{
    TARGET_GUILD=process.env.TEST_GUILD_ID;
} else {
    TARGET_GUILD=process.env.FAMIREE_GUILD_ID;
}

console.log(`Target Guild: ${TARGET_GUILD}`)

// Load up the discord.js library
const Discord = require("discord.js");
const congo = require('./bot-conglomorate.js');
const fnstats = require('./fnstats.js');
const wzstats = require('./wzstats.js');
const commandList = require('./commands.js').commands;

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token
const config = require("./config.js");
// config.token contains the bot's token

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    client.user.setActivity(`${client.guilds.cache.size} servers for fools`);

    var commandNames = [];
    commandList.forEach(ele => commandNames.push(ele.command));

    // fnstats.execute(client);
     wzstats.execute(client);

    load_slash_congos(commandNames);

    client.ws.on('INTERACTION_CREATE', async interaction => {
        // do stuff and respond here
        for (let cmd of commandList) {
            if (cmd.command === interaction.data.name) {
                congo.execute(cmd.command, cmd.args, client, interaction);
                break;
            }
        }
    });

});

function add_slash_command(command) {
    return new Promise((good, bad) => {
        congo
            .get_slash(command)
            .then(res => {
                console.log(`Added ${command}!`);
                client.api.applications(client.user.id).guilds(TARGET_GUILD).commands.post({ data: res });
                good("yes");
            })
            .catch(err => {
                console.log("Problem receiving help from bot-congo: " + err);
                good(err);
            });
    });
}

function load_slash_congos(congoList) {
    var promises = [];
    for (var i = 0; i < congoList.length; i++) {
        promises.push(add_slash_command(congoList[i]));
    }

    Promise.all(promises).then(results => {
        console.log("All promises received, checking for failures to redo...");
        var idx;
        var redos = [];
        for (idx = 0; idx < results.length; ++idx) {
            if (results[idx] !== "yes") {
                console.log(`Redoing ${results[idx]}...`);
                redos.push(results[idx]);
            }
        }

        if (redos.length != 0) {
            setTimeout(() => { load_slash_congos(redos) }, 60000);
        } else {
            console.log("No redos. Nice.")
        }
    });
}

client.login(config.token)
    .catch(err => {
        console.log(err);
    });
//client.on('debug', console.log);
client.on('error', (error) => console.log(error));
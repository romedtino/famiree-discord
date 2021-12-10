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
const txttomp3 = require("text-to-mp3");
const path = require("path");
const { existsSync } = require("fs");
const emojiStrip = require('emoji-strip')

const congo = require('./bot-conglomorate.js');
const fnstats = require('./fnstats.js');
const wzstats = require('./wzstats.js');

const commandList = require('./commands.js').commands;

const out_dir = "/usr/share/hassio/homeassistant/www/voice";

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token
const config = require("./config.js");
// config.token contains the bot's token

var join_queue = [];

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    client.user.setActivity(`${client.guilds.cache.size} servers for fools`);

    var commandNames = [];
    commandList.forEach(ele => commandNames.push(ele.command));

    fnstats.execute(client);
    //  wzstats.execute(client);

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


var running = false;
async function pop_voice_queue() {
    console.log("popping voice queue");
    running = true;
    let mem = join_queue.shift();
    if(!mem) return;
    try {
        var connection = await mem.channel.join();
        const dispatcher = connection.play(mem.audio);
        dispatcher.on("finish", end => {
            if(join_queue.length <= 0) {
                mem.channel.leave();
                running = false;
            } else {
                pop_voice_queue();
            }
        });
    } catch (err) {
        console.log(err);
        mem.channel.leave();
        running = false;
    }
    
}

client.on("voiceStateUpdate", (oldState, newState) => {
    console.log("voiceStateUpdate");
    if (oldState.member.user.bot) return;
    
    let message = "";
    let channel = null;
    let username = emojiStrip(oldState.member.user.username);
    let activeID = newState.channelID;
    if (newState.channelID === null) {
        //User left channel
        message = `${username} has lept`;
        channel = oldState.channel;
        activeID = oldState.channelID;

    } else if(newState.channelID == oldState.channelID) {
        //state change or changed channel
        console.log(newState);
        return;
    } else  if (oldState.channelID === null || newState.channelID != oldState.channelID){
        //User switched channels
        message = `mamsir ${username} is present`;
        channel = newState.channel;
    }

    if(channel.members.size == 0) return;

    if(existsSync(path.join(out_dir, `${message}.mp3`))) {

        join_queue.push({channelID: activeID, audio: path.join(out_dir, `${message}.mp3`), channel: channel});
        if(!running) pop_voice_queue();
        } else {
        console.log("creating file");
        txttomp3.saveMP3(message, path.join(out_dir, `${message}.mp3`), {tl: "en"}).then(filepath => {
            join_queue.push({channelID: activeID, audio: filepath, channel: channel});
            if(!running) pop_voice_queue();
            
        });
        }
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
        console.log("LOGIN ERR:", err);
    });
//client.on('debug', console.log);
client.on('error', (error) => console.log("ONERR:", error));
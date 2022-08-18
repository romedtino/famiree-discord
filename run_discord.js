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
const { REST } = require('@discordjs/rest');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const { VoiceConnectionStatus } = require("@discordjs/voice");
const { AudioPlayerStatus } = require("@discordjs/voice");
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
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildVoiceStates]});

// Here we load the config.json file that contains our token
const config = require("./config.js");

// config.token contains the bot's token

var join_queue = [];

const rest = new REST({ version: '10' }).setToken(config.token);

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    client.user.setActivity(`${client.guilds.cache.size} servers for fools`);

    var commandNames = [];
    commandList.forEach(ele => commandNames.push(ele.command));

    //fnstats.execute(client, congo);
    //  wzstats.execute(client);

    load_slash_congos(commandNames);

    // client.ws.on('INTERACTION_CREATE', async interaction => {
    //     // do stuff and respond here
    //     for (let cmd of commandList) {
    //         if (cmd.command === interaction.data.name) {
    //             congo.execute(cmd.command, cmd.args, client, interaction);
    //             break;
    //         }
    //     }
    // });

});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

	for (let cmd of commandList) {
        if (cmd.command === interaction.commandName) {
            congo.execute(cmd.command, cmd.args, client, interaction);
            break;
        }
    }
});

function delay(t) {
    return new Promise(resolve => {
        setTimeout(resolve, t);
    });
}

var running = false;
async function pop_voice_queue() {
    console.log("popping voice queue");
    running = true;
    let mem = join_queue.shift();
    if(!mem) {
        running = false;
        return true;
    }
    try {
        await delay(1);
        console.log("trying to join voice");
        var connection = joinVoiceChannel({
            channelId: mem.channel.id,
            guildId: mem.channel.guild.id,
            adapterCreator: mem.channel.guild.voiceAdapterCreator,
        });
        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log("channel joined");
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });
            player.play(createAudioResource(mem.audio));
            const dispatcher = connection.subscribe(player);
            player.on(AudioPlayerStatus.Idle, () =>{
                console.log("audio should have played?");
                
                    if(join_queue.length <= 0) {
                        console.log("all done. destroying audio");
                        connection.destroy();
                        running = false;
                    } else {
                        pop_voice_queue();
                         
                    }
            });
            
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
    let activeID = newState.channelId;
    if (newState.channelId === null) {
        //User left channel
        message = `${username} has lept`;
        channel = oldState.channel;
        activeID = oldState.channelId;

    } else if(newState.channelId === oldState.channelId) {
        //state change or changed channel
        // console.log("OLD: ", oldState);
        console.log("NEW: ", newState);
        return;
    } else  if (oldState.channelId === null || newState.channelId != oldState.channelId){
        //User switched channels
        message = `mamsir ${username} is present`;
        channel = newState.channel;
    }

    if(channel.members.size == 0) return;

    if(existsSync(path.join(out_dir, `${message}.mp3`))) {
        console.log(`${message}.mp3 exists`)
        join_queue.push({channelId: activeID, audio: path.join(out_dir, `${message}.mp3`), channel: channel});
        if(!running) pop_voice_queue();
    } else {
        console.log("creating file");
        txttomp3.saveMP3(message, path.join(out_dir, `${message}.mp3`), {tl: "en"}).then(filepath => {
            console.log(`playing: ${filepath}`)
            join_queue.push({channelId: activeID, audio: filepath, channel: channel});
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
                // client.api.applications(client.user.id).guilds(TARGET_GUILD).commands.post({ data: res });
                // rest.put(Discord.Routes.applicationGuildCommands(client.user.id,TARGET_GUILD),{ body: [res] });
                good(res);
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
        console.log("All promises received, Submitting to Discord...");
        var idx;
        var commands = [];
        for (idx = 0; idx < results.length; ++idx) {
            commands.push(results[idx]); 
        }

        rest.put(Discord.Routes.applicationGuildCommands(client.user.id,TARGET_GUILD),{ body: commands })
        .then( () => {
            console.log("No redos. Nice.")
        })
        .catch(error => {console.log("Error: ${error}")});

    });

}

client.login(config.token)
    .catch(err => {
        console.log("LOGIN ERR:", err);
    });
//client.on('debug', console.log);
client.on('error', (error) => console.log("ONERR:", error));
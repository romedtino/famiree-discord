var request = require ("request");
const Discord = require("discord.js");
var url=process.env.CONGO_URL;

function vanilla(command, args, raw_opt, client, guildid, chan_name) {
  var payload = { "client" : "123",
                 "username" : "Nobody",
                 "key" : process.env.FAMIREE_KEY,
                "args" : args ,
                 "raw_opt": raw_opt };
  var customUrl = url + command;
  request.post({
    url: customUrl,
    json: payload
  }, (error, response, body) => {
    //see if its json
    if(body["text"] === undefined) {
      // new Discord.WebhookClient(client.user.id, interaction.token).send(body);
      client.guilds.cache.find(val => {
        if(val.id === guildid) {
          val.channels.cache.find(chanVal => {
            if(chanVal.name === chan_name) {
              let channel = client.channels.cache.get(chanVal.id);
              channel.send(`${body}`);
            }
          });
        }
      });
    } else {
      // new Discord.WebhookClient(client.user.id, interaction.token).send(body.text, {
      //   files: [body.attachment],
      // });
      client.guilds.cache.find(val => {
        if(val.id === guildid) {
          val.channels.cache.find(chanVal => {
            if(chanVal.name === 'general') {
              let channel = client.channels.cache.get(chanVal.id);
              channel.send(body.text, {
                files: [body.attachment],
              });
            }
          });
        }
      });
    }           
  });
}

function execute(command, args, client, interaction) {

  let extra_args = "";
  if (interaction.options._hoistedOptions !== undefined)
  {
    console.log("DEBUG:" + JSON.stringify(interaction.options._hoistedOptions));
    interaction.options._hoistedOptions.forEach(e => {
      if(e.value !== undefined) {
        extra_args += e.value + " ";
      }        
    });
  }
    
  var payload = { "client" : interaction.member.user.id,
                 "username" : interaction.member.user.username,
                 "key" : process.env.FAMIREE_KEY,
                "args" : args + extra_args.trim(),
                 "raw_opt": interaction.options._hoistedOptions };
  
  var customUrl = url + command;

  console.log("Sending loading...");
  interaction.deferReply().then( () => {
      request.post({
          url: customUrl,
          json: payload
      }, (error, response, body) => {
        console.log(JSON.stringify(body));
        //see if its json
        if(body["text"] === undefined) {
          interaction.editReply(body);
        
        } else {
          
          const exampleEmbed = { image: {url: body.attachment}}
          interaction.editReply({content: body.text, embeds: [exampleEmbed]});
          
        }           
    });
  });
  

}

function get_slash(command) {
  return new Promise( (resolve, reject) => {
    var customUrl = url + command + "/get_slash";
    console.log("[CONGO] - Grabbing slash: " + customUrl);
    request.post(customUrl, (error, res, body) => {
      if(error) {
        console.log("Error on URL request " + error);
        return reject(command);
      }
      try {
        resolve(JSON.parse(body));
      }catch(err) {
        console.log("Error on JSON parse " + err);
        reject(command);
      }
    });
  });
}

module.exports.execute = execute;
module.exports.get_slash = get_slash;
module.exports.vanilla = vanilla;
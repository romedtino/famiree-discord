var request = require ("request");
const config = require('./config.js');

const { promisify } = require('util')
const sleep = promisify(setTimeout)

var url="https://bot-conglomorate.glitch.me/";

function execute(command, args, message) {
    
  var payload = { "client" : message.author.id,
                 "username" : message.author.username,
                 "key" : process.env.FAMIREE_KEY,
                "args" : args };
  
  var customUrl = url + command;
  
  request.post({
            url: customUrl,
            json: payload
        }, (error, response, body) => {
            message.channel.send(body);
            message.delete()
              .then(() => console.log("message deleted."))
              .catch(console.error);
  });
}

function help(command) {
  return new Promise( (resolve, reject) => {
      var customUrl = url + command + "/help" + "?prefix=" + config.prefix;
      console.log("[CONGO] - Grabbing help: " + customUrl);
      request.post(customUrl, (error, res, body) => {
        try {
          var json_help = JSON.parse(body);
          resolve(json_help);

        } catch (err){
          console.log(`${command} Received HTML not JSON. Probably waking up issue...`);
          console.log(body);
          reject(command);
        }
      });
  });
}

module.exports.execute = execute;
module.exports.help = help;
var request = require ("request");
const config = require('./config.js');

var url="https://bot-conglomorate.glitch.me/";

function execute(command, args, message) {
    
  var payload = { "client" : message.author.id,
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

    request.get(customUrl, (error, res, body) => {
      resolve(JSON.parse(body));
    });
  });
}

module.exports.execute = execute;
module.exports.help = help;
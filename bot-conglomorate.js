var request = require ("request");
const config = require('./config.js');

var url=process.env.CONGO_URL;
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
    request.get(customUrl, (error, res, body) => {
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
module.exports.help = help;
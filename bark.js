var filter = require('./channel_filter.js')
var request = require ("request");
var dog = "https://random.dog/woof.json"

var jsCommand = "bark";

function help_info() {
  var help = {};
  help["command"] = jsCommand;
  help["help"] = "Get a random doggo. Usage: `!"+ jsCommand + "`"

  return help;

}

function execute(command, args, message) {
  if(command === jsCommand && filter(message)) {
    request({
            url: dog,
            json: true
        }, function (error, response, body) {
            console.log(body);
            message.channel.send("<@" + message.author.id + "> bark! " + body.url);
            })
  }

}

module.exports.execute = execute;
module.exports.help_info = help_info;

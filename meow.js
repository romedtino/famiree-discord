var filter = require('./channel_filter.js')
var request = require ("request");
var cat = "http://aws.random.cat/meow.php"

var jsCommand = "meow";

function help_info() {
  var help = {};
  help["command"] = jsCommand;
  help["help"] = "Get a random kirry. Usage: `!meow`"

  return help;

}

function execute(command, args, message) {
  if(command === jsCommand && filter(message)) {
    request({
            url: cat,
            json: true
        }, function (error, response, body) {
            if(body.file === undefined )
            {
              message.channel.send("<@" + message.author.id +"> Sorry the meow API is overloaded... try again later.");
            }
            else {
              message.channel.send("<@" + message.author.id + "> meow! " + body.file);
              message.delete()
                .then(() => console.log("message deleted."))
                .catch(console.error);
            }
            });
  }

}

module.exports.execute = execute;
module.exports.help_info = help_info;

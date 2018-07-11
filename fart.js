var filter = require('./channel_filter.js')

function help_info() {
  var help = {};
  help["command"] = "fart";
  help["help"] = "Fart on a user. Usage: `!fart <USERNAME>`"

  return help;

}

function fart(command, args, message) {
  if(command === "fart" && filter(message)) {
    message.channel.send("<@" + message.author.id + "> farts on " + args + " with a soft soggy wet one");
  }

}

module.exports = fart;
module.exports.help_info = help_info;

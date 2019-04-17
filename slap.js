var filter = require('./channel_filter.js')

function help_info() {
  var help = {};
  help["command"] = "slap";
  help["help"] = "Slap someone with a trout. Usage: `!slap <USERNAME>`";

  return help;
 
}

function execute(command, args, message) {
  
  if(command === "slap" && filter(message)) {
    message.channel.send("<@" + message.author.id + "> slaps " + args + " around a bit with a large trout");
    message.delete()
    .then(() => console.log("message deleted."))
    .catch(console.error);
  }


}

module.exports.execute = execute;
module.exports.help_info = help_info;

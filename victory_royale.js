var filter = require('./channel_filter.js')

var cmd = "royale";

var winners = [ "Sajedene" ];

function help_info() {
  var help = {};
  help["command"] = cmd;
  help["help"] = "List people who have won a solo game on Fortnite. Usage `!royale`";

  return help;
 
}

function execute(command, args, message) {
  
  if(command === cmd && filter(message)) {
    var msg = "https://media1.tenor.com/images/d89ba4e965cb9144c82348a1c234d425/tenor.gif \n\n";
    msg +="**[Battle Royale] [Victory Royale]**\n";
    msg +="*__Exlusive__ Member* list:\n";
    for(var i=0;i<winners.length;i++) {
      msg += "        `" + winners[i] + "`\n";
    }
    message.channel.send(msg);
  }

}

module.exports.execute = execute;
module.exports.help_info = help_info;
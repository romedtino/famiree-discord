var filter = require('./channel_filter.js')

function help_info() {
  var help = {};
  help["command"] = "poll";
  help["help"] = "Start a poll. Usage: `!poll [Poll Question],[Option 1 emoji],[Option 1 text],[Option 2 emoji],[Option 2 text],...[Option N emoji],[Option N text]`";
  help["help"] = "\n    e.g. `!poll Who is the best at making breakfast?, :laughing: , John Adams, :rofl:, Benjamin Button`"

  return help;
 
}

function execute(command, args, message, client) {
  
  if(command === "poll" && filter(message)) {
    var channelName = "polls"
    var pollText = ""
    var pollInfo = args.join(" ").split(',');
    
    if(pollInfo.length % 2 == 0) {
      message.channel.send("Bad poll format. Please type `!help` to know how to properly create a poll");
      return
    }
    pollText += pollInfo[0] + "\n"
    console.log("Poll Question: " + pollInfo[0]);
    
    //i=1 -- exclude poll question
    for(var i=1;i < pollInfo.length-1;i=i+2)
    {      
      pollText += pollInfo[i] + " - " + pollInfo[i+1] + "\n"; 
    }
    
    
    client.channels.find("name", channelName).send(pollText)
      .then(function (message) {
      
          for(var i=1;i < pollInfo.length-1;i=i+2)
          {
            var actualText;
            if(pollInfo[i].includes(":")) {
               //custom emoji
              var partial = pollInfo[i].trim().substr(pollInfo[i].lastIndexOf(":"));
              console.log("raw:__" + pollInfo[i].trim() + "__");
              console.log("partial: " + partial);
              var full = partial.substr(0, partial.length-1);
              var tgtEmoji = client.emojis.get(full);
              console.log("full: " + tgtEmoji.id);
              message.react(tgtEmoji);
            } else {
               //standard
               console.log("straight react: " + pollInfo[i].trim());
               message.react(pollInfo[i].trim());
            }            
          }

      }).catch(function() {
          message.channel.send("Something went wonky with creating your poll :(");
      });
   // message.channel.send("<@" + message.author.id + "> slaps " + args + " around a bit with a large trout");
  }


}

module.exports.execute = execute;
module.exports.help_info = help_info;

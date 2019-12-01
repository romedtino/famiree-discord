var filter = require('./channel_filter.js')

function help_info() {
  var help = {};
  help["command"] = "poll";
  help["help"] = "Start a poll. Usage: `!poll [Poll Question],[Option 1 emoji],[Option 1 text],[Option 2 emoji],[Option 2 text],...[Option N emoji],[Option N text]`";
  help["help"] += "\n    e.g. `!poll Who is the best at making breakfast?, :laughing: , John Adams, :rofl:, Benjamin Button`"

  return help;
 
}

function execute(command, args, message) {
  
  if(command === "poll" && filter(message)) {
    var channelName = "polls"; 
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
    
    try
    {
      message.guild.channels.find("name", channelName)
        .send("<@" + message.author.id +"> " + pollText)
        .then(function (pollMessage) {
      
          var promisedReactions = [];
          for(var i=1;i < pollInfo.length-1;i=i+2)
          {
            var actualText;
            if(pollInfo[i].includes(":")) {
              
               //custom emoji
              var partial = pollInfo[i].trim();
              partial = partial.substr(partial.lastIndexOf(":"));
              console.log("emoji part:__" + partial + "__");
              var full = partial.substr(1, partial.length-2);
              console.log("emoji full:__" + full + "__");
              var tgtEmoji = pollMessage.client.emojis.get(full);
              promisedReactions.push(pollMessage.react(tgtEmoji));
            } else {
               //standard
               promisedReactions.push(pollMessage.react(pollInfo[i].trim()));
            }            
          }
        Promise.all(promisedReactions).then( () => {
          message.delete()
            .then(() => console.log("message deleted."))
            .catch(console.error);
        });
      
      })
      .catch(function() {
          message.channel.send("Something went wonky with creating your poll :(");
      });
    } catch(error) 
    {
      console.log(error);
      message.channel.send("The Guild (server) you're on doesn't seem to have a polls channel.");
    }
  }


}

module.exports.execute = execute;
module.exports.help_info = help_info;

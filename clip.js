var request = require('request');
var filter = require('./channel_filter.js')

var twitchAPI = 'https://api.twitch.tv/helix';
var latestClipURL = "";
var latestClipMilli = null;
var mainUser = "";
var clipCount = '&first=100';
var login = "";

function help_info() {
  var help = {};
  help["command"] = "clip";
  help["help"] = "Grabs the latest Twitch.tv clip of a given user. Usage: `!clip [Twitch Username]`\n    e.g. `!clip Sajedene`";

  return help;
 
}

function reset()
{
  latestClipURL = "";
  latestClipMilli = null;
}

var twitchClipsRequest = function(message, extraParams)
{
  var options = { url:twitchAPI + '/clips?' + mainUser + clipCount + extraParams,
                  json: true,
                  headers: {
                    "Client-ID" : process.env.TWITCH_TOKEN
                  }
                };
  
    request(options, function(error, response, body) {
      
      for(var i=0;i< body.data.length;i++) {
        var milli = Date.parse(body.data[i].created_at);
        if(latestClipMilli == null || latestClipMilli < milli) {
          latestClipMilli = milli;
          latestClipURL = body.data[i].url;
        }
      }
      
      if(body.pagination.cursor != null)
      {
        var paginator = "&after=" + body.pagination.cursor;
        twitchClipsRequest(message, paginator);
      } else {
        message.channel.send("<@" + message.author.id + "> here is " + login + "'s latest clip: " + latestClipURL);
        message.delete()
          .then(() => console.log("message deleted."))
          .catch(console.error);
      }
      
    }  
  );
  
}

var getIdAndClip = function(message)
{
   var options = { url:twitchAPI + '/users?login=' + login,
                  json: true,
                  headers: {
                    "Client-ID" : process.env.TWITCH_TOKEN
                  }
                };
  request(options, function(error, response, body) {
    
    if(body.data.length <= 0)
    {
      message.channel.send("<@" + message.author.id + "> - We didn't find a user with the name " + login);  
      message.delete()
        .then(() => console.log("message deleted."))
        .catch(console.error);
    } else {
      var bcastId = body.data[0].id;
      mainUser = 'broadcaster_id=' + bcastId;
      console.log(mainUser);
      twitchClipsRequest(message, "");
    }
  });
  
}

function execute(command, args, message) 
{
  if(command === "clip" && filter(message)) {
     login = args[0];
     reset();
     getIdAndClip(message);
  }
}

module.exports.execute = execute;
module.exports.help_info = help_info;
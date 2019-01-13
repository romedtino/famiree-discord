var request = require('request');
var filter = require('./channel_filter.js')

var twitchAPI = 'https://api.twitch.tv/helix';
var latestClipURL = "";
var latestClipMilli = null;
var mainUser = 'broadcaster_id=' + process.env.BCAST_ID;
var clipCount = '&first=100';

function help_info() {
  var help = {};
  help["command"] = null;
  help["help"] = "";

  return help;
 
}


function twitchClipsRequest(message, extraURLParams)
{
  var options = { url:twitchAPI + '/clips?' + extraURLParams,
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
        twitchClipsRequest(message, mainUser + clipCount + paginator);
      } else {
        message.channel.send("<@" + message.author.id + "> here is Sajedene's latest clip: " + latestClipURL);
        console.log("Found it: " + latestClipURL);
      }
      
    }  
  );
  
}

function execute(command, args, message) 
{
  if(command === "saj" && filter(message)) {
     twitchClipsRequest(message, mainUser + clipCount);
  }
}

module.exports.execute = execute;
module.exports.help_info = help_info;
var filter = require('./channel_filter.js')
var request = require ("request");

let cmd = "evan";

function help_info() {
  var help = {};
  help["command"] = cmd;
  help["help"] = "No one knows what this does... Usage: `!evan `"

  return help;

}

function getLastPlayed(message) {
  var steamCmd = "http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=" + process.env.STEAMKEY + "&steamid=" + process.env.EVANSKEY + "&format=json";
  
  request({
      url: steamCmd,
      json: true
  }, function (error, response, body) {
      if(body.response.total_count < 1) {
        message.channel.send("<@" + message.author.id +">  That's unusual... Evan hasn't tried to mod DOA jiggle physics in awhile. Someone should check if he's alive!");
      } else {
        var appid = body.response.games[0].appid;
        var hash = body.response.games[0].img_logo_url;
        var icon = `http://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${hash}.jpg`
        message.channel.send("<@" + message.author.id +"> :mount_fuji: :mount_fuji: The latest game Evan is modding in **DOA** *jiggle* physics for is `" 
                             + body.response.games[0].name + "`"
                             + `\n ${icon}` );
      }
      });
}

function execute(command, args, message) {
  if(command === cmd && filter(message)) {
    //message.channel.send("<@" + message.author.id +"> ... What's an evan?");
    getLastPlayed(message);
    message.delete()
      .then(() => console.log(`message poof`))
      .catch(console.error);
  }

}

module.exports.execute = execute;
module.exports.help_info = help_info;

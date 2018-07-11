var filter = require('./channel_filter.js')

var meesay = [ "Hi I'm Mr. Meeseeks! Look at me!!",
               "I'm Mr. Meeseeks! oo0o0o0o0o weeeeee! caaaaan doo!",
               "Look at me! Remember to square your shoulders",
               "I'm Mr. Meeseeks. I have to fulfill my purpose so I can go away. Look at me.",
               "Ooh, he's trying!",
               "Your failures are your own, old man. I'm Mr. Meeseeks!"]

function help_info() {
  var help = {};
  help["command"] = "meeseeks";
  help["help"] = "Typing meeseeks anytime will summon a meeseeks from the Banana.";

  return help

}



function randRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function meeseeks(message) {
  var lower_content = message.content.toLowerCase();
  if(lower_content.indexOf("meeseeks") > -1 && filter(message)) {
    var meeChoice = randRange(0, meesay.length); 

     message.channel.send("Meeseeks - *" + meesay[meeChoice] + "*");
     return true;
  }
  return false;  

}

module.exports = meeseeks;
module.exports.help_info = help_info;

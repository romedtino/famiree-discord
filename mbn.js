var filter = require('./channel_filter.js')

var summons = [ "https://cdn.discordapp.com/attachments/463864401011671050/653018647845142533/image0.jpg",
              "https://media.discordapp.net/attachments/463864401011671050/653760018713411603/IMG_20191209_164847.jpg",
               "https://cdn.discordapp.com/attachments/463864401011671050/653809405573333002/IMG_20191209_174004.jpg",
               "https://cdn.discordapp.com/attachments/463864401011671050/654176474756153374/IMG_20191210_202257.jpg",
              ];

var command = "mbn";

var rotateIdx = 0;

function help_info() {
  var help = {};
  help["command"] = command;
  help["help"] = `You know, must be nice. Usage: \`!${command}\``;

  return help;
 
}

function execute(reqCommand, args, message) {
   if(reqCommand === command && filter(message)) {
    return new Promise( (resolve, reject) => {
      var choice = summons[ (rotateIdx++ % summons.length) ];
      message.channel.send(`<@${message.author.id}> says, "Must be nice." \n${choice}`);
      
    });
   }
}

module.exports.execute = execute;
module.exports.help_info = help_info;
module.exports.command = command;
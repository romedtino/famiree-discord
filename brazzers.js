var filter = require('./channel_filter.js')
var imgur = require('imgur');
var fs = require('fs');
var mergeImages = require('merge-images');
var sharp = require('sharp');
const Canvas = require('canvas');
var request = require('request');
var jsCommand = "brazzers";

function help_info() {
  var help = {};
  help["command"] = jsCommand;
  help["help"] = "Put the Brazzers logo on an image. Usage: `!brazzers [URL to image]`"

  return help;

}

function execute(command, args, message) {
  if(command === jsCommand && filter(message)) {
    var brazzersLogoURL = 'https://i.imgur.com/gSnHoXE.jpg';
    var tmpFilename = args[0];
    if(!tmpFilename) {
      tmpFilename = 'https://i.imgur.com/s5AUpuY.jpg';
    }
    var ext = tmpFilename.split('.').pop();
    console.log(tmpFilename);
    
    var seconds = new Date() / 1000;
    
    request(tmpFilename, { encoding: 'binary'}, (err, res, body) => {
      fs.writeFile(`/tmp/img1${seconds}.${ext}`, body, 'binary', errWrite => {
          if(errWrite) console.log(err);
          request(brazzersLogoURL, { encoding: 'binary'}, (err2, res2, body2) => {
            fs.writeFile(`/tmp/img2${seconds}.jpg`, body2, 'binary', errWrite2 => {
              if(errWrite2) console.log(errWrite2);
              sharp(`/tmp/img1${seconds}.${ext}`)
                .resize( { width: 1920 })
                .toFile(`/tmp/img1r${seconds}.jpg`)
                .then( () => {
                  sharp(`/tmp/img2${seconds}.jpg`)
                    .resize( { width: 480 })
                    .toFile(`/tmp/img2r${seconds}.jpg`)
                    .then( () => {
                        sharp(`/tmp/img1r${seconds}.jpg`)
                          .composite([{input: `/tmp/img2r${seconds}.jpg`, gravity: sharp.gravity.southeast }])
                          .toFile(`/tmp/brazzers${seconds}.jpg`)
                          .then( data => {
                            message.channel.send(`<@${message.author.id}> here ya go`, {
                                files: [`/tmp/brazzers${seconds}.jpg`]
                              });
                          })
                          .catch( err => console.log(err));
                    })
                    .catch( err => console.log(err));
                })
                .catch( err => console.log(err));


            });

        });
      });

    });
    
  }

}

module.exports.execute = execute;
module.exports.help_info = help_info;

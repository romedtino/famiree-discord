var whitelist = ["1337-speak",
                 "cousins-trip",
                 "secret-santa-2018",
                 "sports",
                 "general",
                 "bananaonly"
                ]

module.exports = function (message) {

  console.log("Checking channel: " + message.channel.name + " for whitelist.");
  var i;
  for (i=0;i< whitelist.length;++i) {
    if(message.channel.name.indexOf(whitelist[i]) > -1){
      return true;
    }
  }

   return false;
}

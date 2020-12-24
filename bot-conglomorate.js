var request = require ("request");

var url=process.env.CONGO_URL;

function execute(command, args, client, interaction) {

  let extra_args = "";
  if (interaction.data.options !== undefined)
  {
    console.log("DEBUG:" + JSON.stringify(interaction.data.options));
    interaction.data.options.forEach(e => {
      if(e.value !== undefined) {
        extra_args += e.value + " ";
      }        
    });
  }
    
  var payload = { "client" : interaction.member.user.id,
                 "username" : interaction.member.user.username,
                 "key" : process.env.FAMIREE_KEY,
                "args" : args + extra_args.trim(),
                 "raw_opt": interaction.data.options };
  
  var customUrl = url + command;
  
  request.post({
            url: customUrl,
            json: payload
        }, (error, response, body) => {
            client.api.interactions(interaction.id, interaction.token).callback.post({data: {
              type: 3,
              data: {
                tts: false,
                content: body
                }
              }
            });
  });
}

function get_slash(command) {
  return new Promise( (resolve, reject) => {
    var customUrl = url + command + "/get_slash";
    console.log("[CONGO] - Grabbing slash: " + customUrl);
    request.post(customUrl, (error, res, body) => {
      if(error) {
        console.log("Error on URL request " + error);
        return reject(command);
      }
      try {
        resolve(JSON.parse(body));
      }catch(err) {
        console.log("Error on JSON parse " + err);
        reject(command);
      }
    });
  });
}

module.exports.execute = execute;
module.exports.get_slash = get_slash;

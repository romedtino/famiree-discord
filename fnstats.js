var request = require("request");
var filter = require("./channel_filter.js");

var url = "https://api.fortnitetracker.com/v1/profile/pc/";

var intro_text = ["FORTNITE VICTORY ROYALE",
                  "BATTLE ROYALE CHAMPI0NS",
                  "FORTNITE CHAMPIONS",
                  "WINNER, WINNER, CHICKEN DINNER",
                  "THESE ARE YOUR FORNITE CHAMPIONS",
                  "HERE YE, WINNERS",
                  "VICTORY AHOY"];

var url_list = ["https://gamepedia.cursecdn.com/fortnite_gamepedia/1/1d/Victory_royale_2.png?version=bf0cfeff5521ff6c83245314e9efe2ce",
               "https://www.fortwiz.com/assets/emojis/number1.png",
              "https://www.pinclipart.com/picdir/big/416-4162455_victory-royale-png-graphic-design-clipart.png"];

var sub_text = ["Awww yuis! These *mutha truckas* won a battle royale recently!",
                "Guess who won? won again? These winners are back, tell a friend:",
                "Here ye, friends of ol' for you are graced by champions below!",
                "All y0uR Ba53 B310n6 +0 u5!",
                "See winning ain't easy, but these guys right here... It comes easy."]

var userList = {};

var discordClient = null;

var secondLoop = Boolean(false);
let winners = [];

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function lookup(user, timeout) {
  return new Promise((resolve, reject) => {
    sleep(timeout).then(() => {
      request(
        {
          url: url + user,
          headers: {
            "TRN-Api-Key": process.env.FNTRACK_TOKEN
          }
        },
        function(error, response, body) {
          if(error) {
            console.log("Hmm something went wrong querying api..." + error);
            resolve(0);
          }
          let dataParsed = JSON.parse(body);
          //all wins
          let target = dataParsed.lifeTimeStats.find( (stat) => {
            if(stat.key === "Wins") {
              return true;
            }
          });
          
          let total = target.value;

          if (!(dataParsed.epicUserHandle in userList)) {
            // user hasn't been looked up
            console.log(
              `[FNSTATS] New user -  ${dataParsed.epicUserHandle} with score: ${total}`
            );
            userList[dataParsed.epicUserHandle] = total;
            resolve(0);
          } else {
            //user exists, check if value changed
            if (userList[dataParsed.epicUserHandle] != total) {
              //Wins detected!
              console.log(
                `[FNSTATS User ${dataParsed.epicUserHandle} has new score with: ${total}`
              );
              userList[dataParsed.epicUserHandle] = total;
              resolve(dataParsed.epicUserHandle);
            } else {
              resolve(0);
            }
          }
        }
      );
    });
  });
}

function sendMessage(message) {
  discordClient.guilds.find(val => {
    // if (val.name === "TestServer") {
      if(val.name === 'Famiree') {
      val.channels.find(chanVal => {
        if(chanVal.name === '1337-speak') {
        // if (chanVal.name === "general") {
          let channel = discordClient.channels.get(chanVal.id);
          channel.send(`${message}`);
          return;
        }
      });
    }
  });
}

function iterateUserList() {
  let tokens = process.env.FNTRACK_QUERY.split(",");
  let lookupPromises = [];
  for (let i = 0; i < tokens.length; i++) {
    lookupPromises.push(lookup(tokens[i], 3000 * i));
  }
  Promise.all(lookupPromises).then(values => {
    for (let i = 0; i < values.length; i++) {
      if (values[i] != 0) {
        console.log("Entry Approved: " + values[i]);
        winners.push(values[i]);
      }
    }
    if (winners.length > 0 ) {
      
      if(secondLoop) {
        // We've checked our list twice for more winners, send message
        console.log("[FNSTATS] Sending message...")
        let joined = winners.join(' !! ');
        
        let introChoice = randRange(0, intro_text.length);
        let urlChoice = randRange(0, url_list.length); 
        let subChoice = randRange(0, sub_text.length);
        
        
        sendMessage(
          `**${introChoice}!**\n${urlChoice}\n\n${subChoice}\n\`${joined}\``
        );
        
        //Reset since we sent
        secondLoop = Boolean(false);
        winners = [];
        
      } else {
        console.log("[FNSTATS] There's a winner, requeuing...")
        secondLoop = Boolean(true);
      }
      
    }
    
  });
}

function execute(client) {
  discordClient = client;
  iterateUserList();
  setInterval(iterateUserList, 120000);
}

module.exports.execute = execute;

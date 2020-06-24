var request = require("request");
var filter = require("./channel_filter.js");

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(".db.json");
const db = low(adapter);

db.defaults({})
  .write();

var url = "https://api.fortnitetracker.com/v1/profile/";

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
      // console.log("[FNSTATS] lookup requesting for - " + user);
      request(
        {
          url: url + user,
          headers: {
            "TRN-Api-Key": process.env.FNTRACK_TOKEN,
          }
        },
        function(error, response, body) {

          if(error) {
            console.log("Hmm something went wrong querying api..." + error);
            return resolve(0);
          }
          let dataParsed = null;
          try {
            dataParsed = JSON.parse(body);
          } catch(err) {
            console.log(err);
            console.log("Failed to parse json body for fnstats");
            console.log(body);
            return resolve(0);
          };
          //all wins
          let target = dataParsed.lifeTimeStats.find( (stat) => {
            if(stat.key === "Wins") {
              return true;
            }
          });
          
          let total = target.value;

          // if (!(dataParsed.epicUserHandle in userList)) {
          if(!db.has(dataParsed.epicUserHandle).value()) {
            // user hasn't been looked up
            console.log(
              `[FNSTATS] New user -  ${dataParsed.epicUserHandle} with score: ${total}`
            );
            db.set(dataParsed.epicUserHandle, total)
              .write();
            // userList[dataParsed.epicUserHandle] = total;
            resolve(0);
          } else {
            //user exists, check if value changed
            cur_val = db.get(dataParsed.epicUserHandle).value()
            if(cur_val < total) {
            // if (userList[dataParsed.epicUserHandle] != total) {
              //Wins detected!
              console.log(
                `[FNSTATS User ${dataParsed.epicUserHandle} has new score with: ${total}`
              );
              // userList[dataParsed.epicUserHandle] = total;
              resolve(dataParsed.epicUserHandle);
            } else {
              console.log("[FNSTATS] No recent wins for " + dataParsed.epicUserHandle + " " + cur_val + "/" + total);
              resolve(0);
            }
            db.set(dataParsed.epicUserHandle, total)
              .write();
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
  // console.log("[FNSTATS] Iterating...");
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
          `**${intro_text[introChoice]}!**\n${url_list[urlChoice]}\n\n${sub_text[subChoice]}\n\`${joined}\``
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
  setInterval(iterateUserList, 180000);
}

module.exports.execute = execute;

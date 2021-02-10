let DEBUG = false

const API = require('call-of-duty-api')();

var guildid = "";
if (DEBUG) {
    guildid = "339633193860988929";
} else {
    guildid = "714045813763866624";
}

var request = require("request");
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(".db-cod.json");
const db = low(adapter);

var url = "https://api.tracker.gg/api/v2/warzone/standard/profile/";

db.defaults({})
  .write();

var intro_text = ["WARZONE VICTORY!",
  "WARZONE STRESS-FREE VICTORY!",
  "WARZONE CHAMPS! GET SOME!",
  "WINNER, WINNER, CHICKEN DINNER",
  "THESE ARE YOUR WARZONE CHAMPIONS",
  "READY FOR THAT TACTICAL NUKE!",
  "DOMINATION!"];

var url_list = ["https://image-cdn.essentiallysports.com/wp-content/uploads/20200516202153/redimensionar2.jpg",
"https://img.republicworld.com/republic-prod/stories/promolarge/xxhdpi/bet8d6mbpvnastho_1584764990.jpeg?tr=w-812,h-464",
"https://i.ytimg.com/vi/rMgy2t2AEXQ/maxresdefault.jpg"];

var sub_text = ["Comrades! We got winners!...and disregard last.",
"What a bunch of champs! Remember, no Russian.",
"You're not seeing Ghost, you're seeing a victory.",
"Oscar Mike boys and girls. Watch out for badasses incoming...",
"Winning is no problem for these goons."]

var discordClient = null;
var secondLoop = Boolean(false);
let winners = [];

function randRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  };

function sendMessage(message) {
    if(discordClient === null) {
        console.log("Discord Client not attached. No message sent.");
        return;
    }

    discordClient.guilds.cache.find(val => {
        if(val.id === guildid) {
            val.channels.cache.find(chanVal => {
            if(chanVal.name === 'general') {
                let channel = discordClient.channels.cache.get(chanVal.id);
                channel.send(`${message}`);
                return;
            }
            });
      }
    });
  }

function lookup_api(platform, username) {
  let stripped = username.split("#")[0];
  return new Promise((resolve, reject) => {
    API.MWBattleData(username, platform).then(data => {
        resVal = 0;
        if(!db.has(stripped).value()) {
            //new user
            console.log(`[WZ] New user ${stripped} with score - ${data.br_all.wins}`);
        } else {
            //existing
            cur_val = db.get(stripped).value();
            if(cur_val < data.br_all.wins) {
                //winner!
                console.log(`[WZ] ${stripped} new score - ${data.br_all.wins}`);
                resVal = stripped;
            } else {
                console.log(`[WZ] No recent wins for ${stripped} - ${cur_val}/${data.br_all.wins}`);
            }
        }
        db.set(stripped, data.br_all.wins)
          .write();
        return resolve(resVal);
    }).catch(err => {
        console.log(`Failed to query ${stripped}`);
        console.log(err);
        return resolve(0);
    });
  });
}

function queryWins() {
  API.login(process.env.COD_EMAIL, process.env.COD_PW).then(() => {
      console.log("logged in!");
      let tokens = process.env.COD_QUERY_API.split(",");

      let promises = [];

      for(i=0;i<tokens.length;++i) {
          let splitted =  tokens[i].split("/");
          promises.push(lookup_api(splitted[0], splitted[1]));
      }

      Promise.all(promises).then(values => {
          for(let i=0;i<values.length;i++) {
              if(values[i] != 0) {
                  //winner!
                  winners.push(values[i]);
              }
          }

          if(winners.length > 0) {

              if(secondLoop) {
                  //Checked list twice
                  let joined = winners.join(' !! ');

                  let introChoice = randRange(0, intro_text.length);
                  let urlChoice = randRange(0, url_list.length); 
                  let subChoice = randRange(0, sub_text.length);
                  let message =  `**${intro_text[introChoice]}!**\n${url_list[urlChoice]}\n\n${sub_text[subChoice]}\n\`${joined}\``;
                  sendMessage(message);

                  //reset
                  secondLoop = Boolean(false);
                  winners = [];
              } else {
                  console.log("[WZ]Winners found. Requeuing..");
                  secondLoop = Boolean(true);
              }
          }
      });
  })
  .catch((e)=> {
      console.log(e);
  });
}

function lookup(user, timeout) {
    return new Promise((resolve, reject) => {
      sleep(timeout).then(() => {
        request(
          {
            url: url + user,
          },
          function(error, response, body) {
            console.log("JEROME RESP: ", response);
            console.log("JEROME BODY: ", body);
            if(error) {
              console.log("Hmm something went wrong querying api..." + error);
              return resolve(0);
            }
            let dataParsed = null;
            let total = 0;
            try {
              dataParsed = JSON.parse(body);
              //all wins
              total =  dataParsed.data.segments[0].stats.wins.value;
            } catch(err) {
              console.log(err);
              console.log("Failed to parse json body for wzstats");
              console.log(body);
              return resolve(0);
            };
            
            let username = user.split("/")[1].split("%")[0];
  
            // if (!(username in userList)) {
            if(!db.has(username).value()) {
              // user hasn't been looked up
              console.log(
                `[WZSTATS] New user -  ${username} with score: ${total}`
              );
              db.set(username, total)
                .write();
              // userList[username] = total;
              resolve(0);
            } else {
              //user exists, check if value changed
              cur_val = db.get(username).value()
              if(cur_val < total) {
              // if (userList[username] != total) {
                //Wins detected!
                console.log(
                  `[WZSTATS] User ${username} has new score with: ${total}`
                );
                // userList[username] = total;
                resolve(username);
              } else {
                console.log("[WZSTATS] No recent wins for " + username + " " + cur_val + "/" + total);
                resolve(0);
              }
              db.set(username, total)
                .write();
            }
          }
        );
      });
    });
  }

function iterateUserList() {
    // console.log("[WZSTATS] Iterating...");
    let tokens = process.env.COD_QUERY.split(",");
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
          console.log("[WZSTATS] Sending message...")
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
          console.log("[WZSTATS] There's a winner, requeuing...")
          secondLoop = Boolean(true);
        }
        
      }
      
    });
  }

function execute(client) {
    discordClient = client;

    //codapi
    queryWins();
    //30min D: == 30min * 60s * 1000ms = 1800000
    setInterval(queryWins,30*60*1000);

    //tracker.gg
    // iterateUserList();
    // setInterval(iterateUserList, 600000);
}
    
module.exports.execute = execute;
module.exports.sendMessage = sendMessage;